import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import multer from "multer";
import { and, asc, desc, eq } from "drizzle-orm";
import { db, profilesTable, serviceCategoriesTable, techniciansTable, workRequestInterestsTable, workRequestPhotosTable, workRequestsTable } from "@workspace/db";
import {
  CreateWorkRequestBody,
  CreateWorkRequestResponse,
  GetWorkRequestParams,
  GetWorkRequestResponse,
  ListMyWorkRequestsResponse,
  ListInterestedTechniciansResponse,
  UpdateWorkRequestBody,
  UpdateWorkRequestParams,
} from "@workspace/api-zod";

const router: IRouter = Router();
const demoCustomerId = "profile-aarav";
const uploadDir = path.resolve(process.cwd(), "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, callback) => callback(null, uploadDir),
    filename: (_req, file, callback) => {
      callback(null, `${crypto.randomUUID()}.upload`);
    },
  }),
  limits: { files: 6, fileSize: 5 * 1024 * 1024 },
  // MIME types and file names are client controlled. Contents are verified below.
  fileFilter: (_req, _file, callback) => callback(null, true),
});

function removeFiles(files: Express.Multer.File[]): void {
  for (const file of files) fs.rmSync(file.path, { force: true });
}

function imageExtension(filePath: string): ".jpg" | ".png" | ".webp" | ".gif" | null {
  const bytes = fs.readFileSync(filePath);
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return ".jpg";
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return ".png";
  if (bytes.length >= 12 && bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP") return ".webp";
  if (bytes.length >= 6 && (bytes.subarray(0, 6).toString("ascii") === "GIF87a" || bytes.subarray(0, 6).toString("ascii") === "GIF89a")) return ".gif";
  return null;
}

function validateAndRenameImages(files: Express.Multer.File[]): string | null {
  try {
    for (const file of files) {
      const extension = imageExtension(file.path);
      if (!extension) return "Only valid JPG, PNG, WEBP, and GIF images are allowed.";
      const filename = `${crypto.randomUUID()}${extension}`;
      const nextPath = path.join(uploadDir, filename);
      fs.renameSync(file.path, nextPath);
      Object.assign(file, { filename, path: nextPath });
    }
    return null;
  } catch {
    return "Could not process one of the uploaded photos.";
  }
}

const multipartUpload = (req: Request, res: Response, next: NextFunction): void => {
  upload.array("photos", 6)(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      res.status(400).json({ error: error.code === "LIMIT_FILE_SIZE" ? "Each photo must be 5 MB or smaller." : "You can upload up to 6 photos." });
      return;
    }
    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }
    next();
  });
};

const customerGuard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const customerId = await requireDemoCustomer(req, res);
  if (!customerId) return;
  (req as Request & { demoCustomerId?: string }).demoCustomerId = customerId;
  next();
};

async function requireDemoCustomer(req: Request, res: Response): Promise<string | null> {
  const [profile] = await db.select({ id: profilesTable.id, role: profilesTable.role })
    .from(profilesTable)
    .where(eq(profilesTable.id, demoCustomerId));
  if (!profile) {
    res.status(401).json({ error: "Authentication required." });
    return null;
  }
  if (profile.role.toLowerCase() !== "customer") {
    res.status(403).json({ error: "Only customers can post work requests." });
    return null;
  }
  return profile.id;
}

async function toWorkRequestResponse(request: typeof workRequestsTable.$inferSelect) {
  const photos = await db.select().from(workRequestPhotosTable)
    .where(eq(workRequestPhotosTable.workRequestId, request.id))
    .orderBy(asc(workRequestPhotosTable.createdAt));
  return CreateWorkRequestResponse.parse({
    ...request,
    latitude: request.latitude === null ? null : Number(request.latitude),
    longitude: request.longitude === null ? null : Number(request.longitude),
    budgetMin: request.budgetMin,
    budgetMax: request.budgetMax,
    photos,
  });
}

router.post("/work-requests", customerGuard, multipartUpload, async (req, res): Promise<void> => {
  const customerId = (req as Request & { demoCustomerId?: string }).demoCustomerId;
  if (!customerId) return;

  const files = (req.files || []) as Express.Multer.File[];
  const imageError = validateAndRenameImages(files);
  if (imageError) {
    removeFiles(files);
    res.status(400).json({ error: imageError });
    return;
  }
  const parsed = CreateWorkRequestBody.safeParse({
    categoryId: req.body.categoryId,
    problemTitle: req.body.problemTitle,
    description: req.body.description,
    city: req.body.city,
    area: req.body.area,
    address: req.body.address,
    latitude: req.body.latitude ? Number(req.body.latitude) : null,
    longitude: req.body.longitude ? Number(req.body.longitude) : null,
    preferredDate: req.body.preferredDate ? new Date(`${req.body.preferredDate}T00:00:00.000Z`) : null,
    preferredTime: req.body.preferredTime,
    budgetMin: req.body.budgetMin ? Number(req.body.budgetMin) : null,
    budgetMax: req.body.budgetMax ? Number(req.body.budgetMax) : null,
    budgetText: req.body.budgetText,
    urgency: req.body.urgency,
  });
  if (!parsed.success) {
    removeFiles(files);
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [category] = await db.select({ id: serviceCategoriesTable.id })
    .from(serviceCategoriesTable)
    .where(and(eq(serviceCategoriesTable.id, parsed.data.categoryId), eq(serviceCategoriesTable.active, true)));
  if (!category) {
    removeFiles(files);
    res.status(400).json({ error: "Please choose an active service category." });
    return;
  }

  try {
  const workRequestId = crypto.randomUUID();
  const inserted = await db.transaction(async (tx) => {
    const [request] = await tx.insert(workRequestsTable).values({
      id: workRequestId,
      customerId,
      categoryId: parsed.data.categoryId,
      problemTitle: parsed.data.problemTitle,
      description: parsed.data.description,
      city: parsed.data.city,
      area: parsed.data.area,
      address: parsed.data.address,
      latitude: parsed.data.latitude === null || parsed.data.latitude === undefined ? null : String(parsed.data.latitude),
      longitude: parsed.data.longitude === null || parsed.data.longitude === undefined ? null : String(parsed.data.longitude),
      preferredDate: parsed.data.preferredDate ? parsed.data.preferredDate.toISOString().slice(0, 10) : null,
      preferredTime: parsed.data.preferredTime,
      budgetMin: parsed.data.budgetMin ?? null,
      budgetMax: parsed.data.budgetMax ?? null,
      budgetText: parsed.data.budgetText,
      urgency: parsed.data.urgency,
      status: "OPEN",
    }).returning();
    if (files.length) {
      await tx.insert(workRequestPhotosTable).values(files.map((file) => ({
        id: crypto.randomUUID(),
        workRequestId,
        photoUrl: `/api/uploads/${path.basename(file.filename)}`,
      })));
    }
    return request;
  });

  res.status(201).json(await toWorkRequestResponse(inserted));
  } catch (error) {
    removeFiles(files);
    throw error;
  }
});

router.get("/work-requests/my", async (req, res): Promise<void> => {
  const customerId = await requireDemoCustomer(req, res);
  if (!customerId) return;
  const requests = await db.select().from(workRequestsTable)
    .where(eq(workRequestsTable.customerId, customerId))
    .orderBy(desc(workRequestsTable.createdAt));
  res.json(ListMyWorkRequestsResponse.parse(await Promise.all(requests.map(toWorkRequestResponse))));
});

router.get("/work-requests/:id", async (req, res): Promise<void> => {
  const customerId = await requireDemoCustomer(req, res);
  if (!customerId) return;
  const parsedParams = GetWorkRequestParams.safeParse(req.params);
  if (!parsedParams.success) {
    res.status(400).json({ error: parsedParams.error.message });
    return;
  }
  const [request] = await db.select().from(workRequestsTable)
    .where(and(eq(workRequestsTable.id, parsedParams.data.id), eq(workRequestsTable.customerId, customerId)));
  if (!request) {
    res.status(404).json({ error: "Work request not found." });
    return;
  }
  res.json(GetWorkRequestResponse.parse(await toWorkRequestResponse(request)));
});

router.put("/work-requests/:id", customerGuard, multipartUpload, async (req, res): Promise<void> => {
  const customerId = (req as Request & { demoCustomerId?: string }).demoCustomerId;
  const files = (req.files || []) as Express.Multer.File[];
  const removeNewFiles = () => removeFiles(files);
  if (!customerId) {
    removeNewFiles();
    return;
  }
  const parsedParams = UpdateWorkRequestParams.safeParse(req.params);
  if (!parsedParams.success) {
    removeNewFiles();
    res.status(400).json({ error: parsedParams.error.message });
    return;
  }
  const imageError = validateAndRenameImages(files);
  if (imageError) {
    removeNewFiles();
    res.status(400).json({ error: imageError });
    return;
  }
  const retainPhotoIds = Array.isArray(req.body.retainPhotoIds)
    ? req.body.retainPhotoIds
    : req.body.retainPhotoIds ? [req.body.retainPhotoIds] : [];
  const parsed = UpdateWorkRequestBody.safeParse({
    categoryId: req.body.categoryId,
    problemTitle: req.body.problemTitle,
    description: req.body.description,
    city: req.body.city,
    area: req.body.area,
    address: req.body.address,
    latitude: req.body.latitude ? Number(req.body.latitude) : null,
    longitude: req.body.longitude ? Number(req.body.longitude) : null,
    preferredDate: req.body.preferredDate ? new Date(`${req.body.preferredDate}T00:00:00.000Z`) : null,
    preferredTime: req.body.preferredTime,
    budgetMin: req.body.budgetMin ? Number(req.body.budgetMin) : null,
    budgetMax: req.body.budgetMax ? Number(req.body.budgetMax) : null,
    budgetText: req.body.budgetText,
    urgency: req.body.urgency,
    retainPhotoIds,
  });
  if (!parsed.success) {
    removeNewFiles();
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const retainedIds = parsed.data.retainPhotoIds ?? [];
  const [request] = await db.select().from(workRequestsTable)
    .where(and(eq(workRequestsTable.id, parsedParams.data.id), eq(workRequestsTable.customerId, customerId)));
  if (!request) {
    removeNewFiles();
    res.status(404).json({ error: "Work request not found." });
    return;
  }
  if (request.status !== "OPEN") {
    removeNewFiles();
    res.status(409).json({ error: "Only open work requests can be edited." });
    return;
  }
  const [category] = await db.select({ id: serviceCategoriesTable.id }).from(serviceCategoriesTable)
    .where(and(eq(serviceCategoriesTable.id, parsed.data.categoryId), eq(serviceCategoriesTable.active, true)));
  if (!category) {
    removeNewFiles();
    res.status(400).json({ error: "Please choose an active service category." });
    return;
  }
  const existingPhotos = await db.select().from(workRequestPhotosTable)
    .where(eq(workRequestPhotosTable.workRequestId, request.id));
  const existingIds = new Set(existingPhotos.map((photo) => photo.id));
  if (retainedIds.some((id) => !existingIds.has(id)) || new Set(retainedIds).size !== retainedIds.length) {
    removeNewFiles();
    res.status(400).json({ error: "One or more photos do not belong to this request." });
    return;
  }
  if (retainedIds.length + files.length > 6) {
    removeNewFiles();
    res.status(400).json({ error: "You can attach up to 6 photos." });
    return;
  }
  const removedPhotos = existingPhotos.filter((photo) => !retainedIds.includes(photo.id));
  try {
    const updated = await db.transaction(async (tx) => {
      const [next] = await tx.update(workRequestsTable).set({
        categoryId: parsed.data.categoryId, problemTitle: parsed.data.problemTitle, description: parsed.data.description,
        city: parsed.data.city, area: parsed.data.area, address: parsed.data.address,
        latitude: parsed.data.latitude == null ? null : String(parsed.data.latitude), longitude: parsed.data.longitude == null ? null : String(parsed.data.longitude),
        preferredDate: parsed.data.preferredDate ? parsed.data.preferredDate.toISOString().slice(0, 10) : null,
        preferredTime: parsed.data.preferredTime, budgetMin: parsed.data.budgetMin ?? null, budgetMax: parsed.data.budgetMax ?? null,
        budgetText: parsed.data.budgetText, urgency: parsed.data.urgency, updatedAt: new Date(),
      }).where(eq(workRequestsTable.id, request.id)).returning();
      if (removedPhotos.length) await tx.delete(workRequestPhotosTable).where(and(eq(workRequestPhotosTable.workRequestId, request.id), ...removedPhotos.map((photo) => eq(workRequestPhotosTable.id, photo.id))));
      if (files.length) await tx.insert(workRequestPhotosTable).values(files.map((file) => ({ id: crypto.randomUUID(), workRequestId: request.id, photoUrl: `/api/uploads/${path.basename(file.filename)}` })));
      return next;
    });
    for (const photo of removedPhotos) fs.rmSync(path.join(uploadDir, path.basename(photo.photoUrl)), { force: true });
    res.json(await toWorkRequestResponse(updated));
  } catch (error) {
    removeNewFiles();
    throw error;
  }
});

router.delete("/work-requests/:id", customerGuard, async (req, res): Promise<void> => {
  const customerId = (req as Request & { demoCustomerId?: string }).demoCustomerId;
  const parsedParams = UpdateWorkRequestParams.safeParse(req.params);
  if (!customerId || !parsedParams.success) {
    res.status(400).json({ error: "Invalid work request." });
    return;
  }
  const [request] = await db.select().from(workRequestsTable).where(and(eq(workRequestsTable.id, parsedParams.data.id), eq(workRequestsTable.customerId, customerId)));
  if (!request) {
    res.status(404).json({ error: "Work request not found." });
    return;
  }
  if (request.status !== "OPEN") {
    res.status(409).json({ error: "Only open work requests can be cancelled." });
    return;
  }
  const [cancelled] = await db.update(workRequestsTable).set({ status: "CANCELLED", updatedAt: new Date() }).where(eq(workRequestsTable.id, request.id)).returning();
  res.json(await toWorkRequestResponse(cancelled));
});

router.get("/work-requests/:id/interested-technicians", async (req, res): Promise<void> => {
  const customerId = await requireDemoCustomer(req, res);
  const parsedParams = UpdateWorkRequestParams.safeParse(req.params);
  if (!customerId || !parsedParams.success) {
    res.status(400).json({ error: "Invalid work request." });
    return;
  }
  const [request] = await db.select({ id: workRequestsTable.id }).from(workRequestsTable)
    .where(and(eq(workRequestsTable.id, parsedParams.data.id), eq(workRequestsTable.customerId, customerId)));
  if (!request) {
    res.status(404).json({ error: "Work request not found." });
    return;
  }
  const rows = await db.select().from(workRequestInterestsTable).where(eq(workRequestInterestsTable.workRequestId, request.id));
  const technicians = rows.length ? await db.select().from(techniciansTable) : [];
  const byId = new Map(technicians.map((technician) => [technician.id, technician]));
  res.json(ListInterestedTechniciansResponse.parse(rows.flatMap((interest) => {
    const technician = byId.get(interest.technicianId);
    return technician ? [{ ...interest, technician: { ...technician, rating: Number(technician.rating) } }] : [];
  })));
});

export default router;

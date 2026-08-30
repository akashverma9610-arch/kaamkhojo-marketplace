import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import multer from "multer";
import { and, asc, desc, eq } from "drizzle-orm";
import { db, profilesTable, serviceCategoriesTable, workRequestPhotosTable, workRequestsTable } from "@workspace/db";
import {
  CreateWorkRequestBody,
  CreateWorkRequestResponse,
  GetWorkRequestParams,
  GetWorkRequestResponse,
  ListMyWorkRequestsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();
const demoCustomerId = "profile-aarav";
const uploadDir = path.resolve(process.cwd(), "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, callback) => callback(null, uploadDir),
    filename: (_req, file, callback) => {
      const extension = path.extname(file.originalname).toLowerCase();
      callback(null, `${crypto.randomUUID()}${extension}`);
    },
  }),
  limits: { files: 6, fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.mimetype)) {
      callback(new Error("Only JPG, PNG, WEBP, and GIF images are allowed."));
      return;
    }
    callback(null, true);
  },
});

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
    for (const file of files) fs.rmSync(file.path, { force: true });
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [category] = await db.select({ id: serviceCategoriesTable.id })
    .from(serviceCategoriesTable)
    .where(and(eq(serviceCategoriesTable.id, parsed.data.categoryId), eq(serviceCategoriesTable.active, true)));
  if (!category) {
    for (const file of files) fs.rmSync(file.path, { force: true });
    res.status(400).json({ error: "Please choose an active service category." });
    return;
  }

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

export default router;
import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, profilesTable } from "@workspace/db";
import {
  GetProfileResponse,
  UpdateProfileBody,
  UpdateProfileResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();
const demoProfileId = "profile-aarav";

router.get("/profile", async (_req, res): Promise<void> => {
  const [profile] = await db
    .select()
    .from(profilesTable)
    .where(eq(profilesTable.id, demoProfileId));

  if (!profile) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }

  res.json(GetProfileResponse.parse(profile));
});

router.patch("/profile", async (req, res): Promise<void> => {
  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [profile] = await db
    .update(profilesTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(profilesTable.id, demoProfileId))
    .returning();

  if (!profile) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }

  res.json(UpdateProfileResponse.parse(profile));
});

export default router;
import { z } from "zod";
import { CreateWorkRequestBody } from "./generated/api";

export const UpdateWorkRequestParams = z.object({ id: z.string().min(1).max(128) });
export const UpdateWorkRequestBody = CreateWorkRequestBody.extend({
  retainPhotoIds: z.array(z.string().uuid()).optional(),
});

export const InterestedTechnicianResponse = z.object({
  id: z.string(),
  message: z.string(),
  status: z.string(),
  createdAt: z.coerce.date(),
  technician: z.object({
    id: z.string(),
    name: z.string(),
    specialty: z.string(),
    serviceCategories: z.array(z.string()),
    rating: z.number(),
    reviewCount: z.number(),
    distance: z.string(),
    location: z.string(),
    avatar: z.string(),
    verified: z.boolean(),
    availableToday: z.boolean(),
  }),
});

export const ListInterestedTechniciansResponse = z.array(InterestedTechnicianResponse);

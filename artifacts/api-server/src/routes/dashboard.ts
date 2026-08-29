import { Router, type IRouter } from "express";
import { asc, eq } from "drizzle-orm";
import { db, serviceRequestsTable } from "@workspace/db";
import {
  GetCustomerDashboardResponse,
  GetTechnicianDashboardResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/dashboard/customer", async (_req, res): Promise<void> => {
  const recentRequests = await db
    .select()
    .from(serviceRequestsTable)
    .where(eq(serviceRequestsTable.customerName, "Aarav Mehta"))
    .orderBy(asc(serviceRequestsTable.id));

  res.json(
    GetCustomerDashboardResponse.parse({
      customerName: "Aarav Mehta",
      location: "Indiranagar, Bengaluru",
      activeRequestCount: recentRequests.filter((request) => request.status === "In progress").length,
      completedJobs: 12,
      savedTechnicians: 4,
      recentRequests,
    }),
  );
});

router.get("/dashboard/technician", async (_req, res): Promise<void> => {
  const upcomingJobs = await db
    .select()
    .from(serviceRequestsTable)
    .where(eq(serviceRequestsTable.technicianName, "Ravi Kumar"))
    .orderBy(asc(serviceRequestsTable.id));

  res.json(
    GetTechnicianDashboardResponse.parse({
      technicianName: "Ravi Kumar",
      location: "Koramangala, Bengaluru",
      todayJobs: upcomingJobs.filter((job) => job.status !== "Completed").length,
      weeklyEarnings: 8450,
      rating: 4.9,
      profileViews: 86,
      upcomingJobs,
    }),
  );
});

export default router;
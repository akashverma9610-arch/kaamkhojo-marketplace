import { Router, type IRouter } from "express";
import { asc } from "drizzle-orm";
import { db, serviceCategoriesTable, techniciansTable } from "@workspace/db";
import {
  ListServiceCategoriesResponse,
  ListTechniciansQueryParams,
  ListTechniciansResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/marketplace/categories", async (_req, res): Promise<void> => {
  const categories = await db
    .select()
    .from(serviceCategoriesTable)
    .orderBy(asc(serviceCategoriesTable.name));

  res.json(ListServiceCategoriesResponse.parse(categories));
});

router.get("/marketplace/technicians", async (req, res): Promise<void> => {
  const parsedQuery = ListTechniciansQueryParams.safeParse(req.query);
  if (!parsedQuery.success) {
    res.status(400).json({ error: parsedQuery.error.message });
    return;
  }

  const { category, location } = parsedQuery.data;
  const technicians = await db
    .select()
    .from(techniciansTable)
    .orderBy(asc(techniciansTable.name));

  const filtered = technicians.filter((technician) => {
        const matchesCategory = category
          ? technician.specialty.toLowerCase().includes(category.toLowerCase())
          : true;
        const matchesLocation = location
          ? technician.location.toLowerCase().includes(location.toLowerCase())
          : true;
        return matchesCategory && matchesLocation;
      });

  res.json(
    ListTechniciansResponse.parse(
      filtered.map((technician) => ({
        ...technician,
        rating: Number(technician.rating),
      })),
    ),
  );
});

export default router;
import { Router, type IRouter } from "express";
import healthRouter from "./health";
import marketplaceRouter from "./marketplace";
import dashboardRouter from "./dashboard";
import profileRouter from "./profile";
import workRequestsRouter from "./work-requests";

const router: IRouter = Router();

router.use(healthRouter);
router.use(marketplaceRouter);
router.use(dashboardRouter);
router.use(profileRouter);
router.use(workRequestsRouter);

export default router;

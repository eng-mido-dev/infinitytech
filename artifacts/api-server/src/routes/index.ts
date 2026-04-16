import { Router, type IRouter } from "express";
import healthRouter from "./health";
import translateRouter from "./translate";
import analyticsRouter from "./analytics";
import commentsRouter from "./comments";
import notificationsRouter from "./notifications";
import projectsRouter from "./projects";
import skillsRouter from "./skills";
import setupRouter from "./setup";
import contactRouter from "./contact";
import pushRouter from "./push";

const router: IRouter = Router();

router.use(healthRouter);
router.use(translateRouter);
router.use(analyticsRouter);
router.use(commentsRouter);
router.use(notificationsRouter);
router.use(projectsRouter);
router.use(skillsRouter);
router.use(setupRouter);
router.use(contactRouter);
router.use(pushRouter);

export default router;

import express from "express";

import authInternal from "../middlewares/authInternal.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

import { getDashboardReports } from "../controllers/report.controller.js";

const router = express.Router();

router.use(authInternal);
router.use(authorizeRoles("ADMIN", "PSYCHOLOGIST"));

router.get("/", getDashboardReports);

export default router;
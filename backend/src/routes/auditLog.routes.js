import express from "express";

import authInternal from "../middlewares/authInternal.js";
import {authorizeRoles} from "../middlewares/authorizeRoles.js";

import { getAuditLogs } from "../controllers/auditLog.controller.js";

const router = express.Router();

router.use(authInternal);
router.use(authorizeRoles("ADMIN"));

router.get("/", getAuditLogs);

export default router;
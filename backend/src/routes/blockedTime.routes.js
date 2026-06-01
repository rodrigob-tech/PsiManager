import { Router } from "express";
import {
  getBlockedTimes,
  getBlockedTimeById,
  createBlockedTime,
  updateBlockedTime,
  deleteBlockedTime
} from "../controllers/blockedTime.controller.js";
import authInternal from "../middlewares/authInternal.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
const router = Router();
router.use(authInternal);
router.use(authorizeRoles("ADMIN", "PSYCHOLOGIST"));
router.get("/", getBlockedTimes);
router.get("/:id", getBlockedTimeById);
router.post("/", createBlockedTime);
router.put("/:id", updateBlockedTime);
router.delete("/:id", deleteBlockedTime);

export default router;
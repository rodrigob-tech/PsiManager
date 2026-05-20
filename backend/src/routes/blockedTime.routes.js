import { Router } from "express";
import {
  getBlockedTimes,
  getBlockedTimeById,
  createBlockedTime,
  updateBlockedTime,
  deleteBlockedTime
} from "../controllers/blockedTime.controller.js";

const router = Router();

router.get("/", getBlockedTimes);
router.get("/:id", getBlockedTimeById);
router.post("/", createBlockedTime);
router.put("/:id", updateBlockedTime);
router.delete("/:id", deleteBlockedTime);

export default router;
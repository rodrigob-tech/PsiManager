import { Router } from "express";
import {
  getSpaces,
  getSpaceById,
  createSpace,
  updateSpace,
  deleteSpace
} from "../controllers/space.controller.js";

const router = Router();

router.get("/", getSpaces);
router.get("/:id", getSpaceById);
router.post("/", createSpace);
router.put("/:id", updateSpace);
router.delete("/:id", deleteSpace);

export default router;
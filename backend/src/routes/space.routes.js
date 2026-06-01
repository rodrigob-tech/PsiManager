import { Router } from "express";
import {
  getSpaces,
  getSpaceById,
  createSpace,
  updateSpace,
  deleteSpace
} from "../controllers/space.controller.js";
import authInternal from "../middlewares/authInternal.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
const router = Router();
router.use(authInternal);
router.use(authorizeRoles("ADMIN", "PSYCHOLOGIST"));
router.get("/", getSpaces);
router.get("/:id", getSpaceById);
router.post("/", createSpace);
router.put("/:id", updateSpace);
router.delete("/:id", deleteSpace);

export default router;
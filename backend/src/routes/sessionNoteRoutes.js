import { Router } from "express";
import {
  createSessionNoteController,
  deleteSessionNoteController,
  getSessionNoteByIdController,
  getSessionNotesByMedicalRecordController,
  updateSessionNoteController
} from "../controllers/sessionNoteController.js";
import authInternal from "../middlewares/authInternal.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
const router = Router();
router.use(authInternal);
router.use(authorizeRoles("ADMIN", "PSYCHOLOGIST"));

router.post("/", createSessionNoteController);
router.get("/medical-record/:medicalRecordId", getSessionNotesByMedicalRecordController);
router.get("/:id", getSessionNoteByIdController);
router.put("/:id", updateSessionNoteController);
router.delete("/:id", deleteSessionNoteController);

export default router;

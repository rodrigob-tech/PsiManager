import { Router } from "express";
import {
  createSessionNote,
  deleteSessionNote,
  getSessionNoteById,
  getSessionNotesByMedicalRecordId,
  getSessionNotes,
  updateSessionNote
} from "../controllers/sessionNote.controller.js";
import authInternal from "../middlewares/authInternal.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
const router = Router();
router.use(authInternal);
router.use(authorizeRoles("ADMIN", "PSYCHOLOGIST"));
router.get("/", getSessionNotes);
router.get("/medical-record/:medicalRecordId", getSessionNotesByMedicalRecordId);
router.get("/:id", getSessionNoteById);
router.post("/", createSessionNote);
router.put("/:id", updateSessionNote);
router.delete("/:id", deleteSessionNote);
export default router;

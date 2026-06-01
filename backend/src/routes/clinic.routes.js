import express from "express";

import authInternal from "../middlewares/authInternal.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

import {
  createClinic,
  getMyClinic,
  updateMyClinic,
  listClinicUsers,
  createClinicPsychologist,
  updateClinicUserStatus,
} from "../controllers/clinic.controller.js";

// ADMIN e PSYCHOLOGIST podem ver a clínica
// Só ADMIN pode criar/editar clínica e gerenciar psicólogos
const router = express.Router();

router.use(authInternal);
router.use(authorizeRoles("ADMIN", "PSYCHOLOGIST"));

router.get("/me", getMyClinic);

router.use(authorizeRoles("ADMIN"));

router.post("/", createClinic);
router.put("/me", updateMyClinic);
router.get("/me/users", listClinicUsers);
router.post("/me/psychologists", createClinicPsychologist);
router.patch("/me/users/:userId/status", updateClinicUserStatus);

export default router;
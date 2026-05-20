import {
  createMedicalRecord,
  getMedicalRecordById,
  getMedicalRecordByPatientId,
  getMedicalRecords,
  updateMedicalRecord
} from "../services/medicalRecordService.js";

const MEDICAL_RECORD_STATUSES = ["OPEN", "CLOSED", "ARCHIVED"];

const optionalStringFields = [
  "mainComplaint",
  "diagnosisHypothesis",
  "clinicalNotes"
];

const normalizeOptionalString = (value) => {
  if (typeof value !== "string") return value ?? null;

  const trimmed = value.trim();
  return trimmed || null;
};

const buildMedicalRecordData = (body, { partial = false } = {}) => {
  const data = {};

  if (!partial || Object.prototype.hasOwnProperty.call(body, "patientId")) {
    data.patientId = body.patientId;
  }

  if (!partial || Object.prototype.hasOwnProperty.call(body, "psychologistId")) {
    data.psychologistId = body.psychologistId || null;
  }

  optionalStringFields.forEach((field) => {
    if (!partial || Object.prototype.hasOwnProperty.call(body, field)) {
      data[field] = normalizeOptionalString(body[field]);
    }
  });

  if (!partial || Object.prototype.hasOwnProperty.call(body, "status")) {
    data.status = body.status || "OPEN";
  }

  return data;
};

const validateMedicalRecordData = (data, { creating = false } = {}) => {
  if (creating && !data.patientId) {
    return "patientId é obrigatório";
  }

  if (data.status && !MEDICAL_RECORD_STATUSES.includes(data.status)) {
    return "Status do prontuário inválido";
  }

  return null;
};

export const createMedicalRecordController = async (req, res) => {
  try {
    const data = buildMedicalRecordData(req.body);
    const validationError = validateMedicalRecordData(data, { creating: true });

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const medicalRecord = await createMedicalRecord(data);
    res.status(201).json(medicalRecord);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Paciente já possui prontuário" });
    }

    if (error.code === "P2003") {
      return res.status(404).json({ error: "Paciente ou psicólogo não encontrado" });
    }

    res.status(500).json({ error: "Erro ao criar prontuário" });
  }
};

export const getMedicalRecordsController = async (req, res) => {
  try {
    const medicalRecords = await getMedicalRecords();
    res.json(medicalRecords);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar prontuários" });
  }
};

export const getMedicalRecordByIdController = async (req, res) => {
  try {
    const medicalRecord = await getMedicalRecordById(req.params.id);

    if (!medicalRecord) {
      return res.status(404).json({ error: "Prontuário não encontrado" });
    }

    res.json(medicalRecord);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar prontuário" });
  }
};

export const getMedicalRecordByPatientIdController = async (req, res) => {
  try {
    const medicalRecord = await getMedicalRecordByPatientId(req.params.patientId);

    if (!medicalRecord) {
      return res.status(404).json({ error: "Prontuário não encontrado" });
    }

    res.json(medicalRecord);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar prontuário do paciente" });
  }
};

export const updateMedicalRecordController = async (req, res) => {
  try {
    const existingMedicalRecord = await getMedicalRecordById(req.params.id);

    if (!existingMedicalRecord) {
      return res.status(404).json({ error: "Prontuário não encontrado" });
    }

    const data = buildMedicalRecordData(req.body, { partial: true });
    delete data.patientId;

    const validationError = validateMedicalRecordData({
      ...existingMedicalRecord,
      ...data
    });

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const medicalRecord = await updateMedicalRecord(req.params.id, data);
    res.json(medicalRecord);
  } catch (error) {
    if (error.code === "P2003") {
      return res.status(404).json({ error: "Psicólogo não encontrado" });
    }

    res.status(500).json({ error: "Erro ao atualizar prontuário" });
  }
};

import prisma from "../prisma/client.js";

const PATIENT_STATUSES = ["ACTIVE", "INACTIVE", "ARCHIVED"];

const optionalStringFields = [
  "email",
  "phone",
  "cpf",
  "gender",
  "emergencyName",
  "emergencyPhone",
  "guardianName",
  "guardianPhone",
  "address",
  "notes"
];

const hasField = (body, field) => Object.prototype.hasOwnProperty.call(body, field);

const normalizeOptionalString = (value) => {
  if (typeof value !== "string") return value ?? null;

  const trimmed = value.trim();
  return trimmed || null;
};

const buildPatientData = (body, { partial = false } = {}) => {
  const data = {};

  if (!partial || hasField(body, "name")) {
    data.name = typeof body.name === "string" ? body.name.trim() : body.name;
  }

  optionalStringFields.forEach((field) => {
    if (!partial || hasField(body, field)) {
      data[field] = normalizeOptionalString(body[field]);
    }
  });

  if (!partial || hasField(body, "birthDate")) {
    data.birthDate = body.birthDate ? new Date(body.birthDate) : null;
  }

  if (!partial || hasField(body, "status")) {
    data.status = body.status || "ACTIVE";
  }

  return data;
};

const validatePatientData = (data) => {
  if (!data.name) {
    return "Nome do paciente é obrigatório";
  }

  if (data.birthDate && Number.isNaN(data.birthDate.getTime())) {
    return "Data de nascimento inválida";
  }

  if (data.status && !PATIENT_STATUSES.includes(data.status)) {
    return "Status do paciente inválido";
  }

  return null;
};

export const getPatients = async (req, res) => {
  try {
    const patients = await prisma.patient.findMany({
      orderBy: { name: "asc" }
    });

    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar pacientes" });
  }
};

export const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await prisma.patient.findUnique({
      where: { id }
    });

    if (!patient) {
      return res.status(404).json({ error: "Paciente não encontrado" });
    }

    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar paciente" });
  }
};

export const createPatient = async (req, res) => {
  try {
    const data = buildPatientData(req.body);
    const validationError = validatePatientData(data);

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const patient = await prisma.patient.create({
      data
    });

    res.status(201).json(patient);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Já existe um paciente com este email" });
    }

    res.status(500).json({ error: "Erro ao criar paciente" });
  }
};

export const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;

    const patientExists = await prisma.patient.findUnique({
      where: { id }
    });

    if (!patientExists) {
      return res.status(404).json({ error: "Paciente não encontrado" });
    }

    const data = buildPatientData(req.body, { partial: true });
    const validationError = validatePatientData({
      ...patientExists,
      ...data
    });

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const updatedPatient = await prisma.patient.update({
      where: { id },
      data
    });

    res.json(updatedPatient);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Já existe um paciente com este email" });
    }

    res.status(500).json({ error: "Erro ao atualizar paciente" });
  }
};

export const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;

    const patientExists = await prisma.patient.findUnique({
      where: { id }
    });

    if (!patientExists) {
      return res.status(404).json({ error: "Paciente não encontrado" });
    }

    await prisma.patient.delete({
      where: { id }
    });

    res.json({ message: "Paciente removido com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao remover paciente" });
  }
};

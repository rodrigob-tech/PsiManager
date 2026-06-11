import prisma from "../prisma/client.js";
import { createAuditLog } from "../services/auditLog.service.js";
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
  "notes",
];

function hasField(body, field) {
  return Object.prototype.hasOwnProperty.call(body, field);
}

function normalizeOptionalString(value) {
  if (value === undefined) return undefined;
  if (value === null) return null;

  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed || null;
}

function getClinicId(req) {
  return req.user?.clinicId || null;
}

function buildPatientData(body, { partial = false } = {}) {
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

  if (!partial || hasField(body, "isActive")) {
    if (typeof body.isActive === "boolean") {
      data.isActive = body.isActive;
    }
  }

  return data;
}

function validatePatientData(data) {
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
}

export const getPatients = async (req, res) => {
  try {
    const clinicId = getClinicId(req);

    if (!clinicId) {
      return res.status(400).json({
        error: "Usuário não está vinculado a uma clínica",
      });
    }

    const patients = await prisma.patient.findMany({
      where: {
        clinicId,
      },
      orderBy: {
        name: "asc",
      },
    });

    res.json(patients);
  } catch (error) {
    console.error("Erro ao buscar pacientes:", error);
    res.status(500).json({ error: "Erro ao buscar pacientes" });
  }
};

export const getPatientById = async (req, res) => {
  try {
    const clinicId = getClinicId(req);
    const { id } = req.params;

    if (!clinicId) {
      return res.status(400).json({
        error: "Usuário não está vinculado a uma clínica",
      });
    }

    const patient = await prisma.patient.findFirst({
      where: {
        id,
        clinicId,
      },
    });

    if (!patient) {
      return res.status(404).json({
        error: "Paciente não encontrado nesta clínica",
      });
    }

    res.json(patient);
  } catch (error) {
    console.error("Erro ao buscar paciente:", error);
    res.status(500).json({ error: "Erro ao buscar paciente" });
  }
};

export const createPatient = async (req, res) => {
  try {
    const clinicId = getClinicId(req);

    if (!clinicId) {
      return res.status(400).json({
        error: "Usuário não está vinculado a uma clínica",
      });
    }

    const data = buildPatientData(req.body);
    const validationError = validatePatientData(data);

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    if (data.email) {
      const existingPatientWithEmail = await prisma.patient.findFirst({
        where: {
          email: data.email,
          clinicId,
        },
      });

      if (existingPatientWithEmail) {
        return res.status(409).json({
          error: "Já existe um paciente com este e-mail nesta clínica",
        });
      }
    }

    if (data.cpf) {
      const existingPatientWithCpf = await prisma.patient.findFirst({
        where: {
          cpf: data.cpf,
          clinicId,
        },
      });

      if (existingPatientWithCpf) {
        return res.status(409).json({
          error: "Já existe um paciente com este CPF nesta clínica",
        });
      }
    }

    const patient = await prisma.patient.create({
      data: {
        ...data,
        clinicId,
      },
    });
    await createAuditLog({
      req,
      action: "PATIENT_CREATED",
      entity: "Patient",
      entityId: patient.id,
      description: `Paciente criado: ${patient.name}`,
      metadata: {
        patientName: patient.name,
        patientEmail: patient.email,
      },
    });

    res.status(201).json(patient);
  } catch (error) {
    console.error("Erro ao criar paciente:", error);

    if (error.code === "P2002") {
      return res.status(409).json({
        error: "Já existe um paciente com estes dados",
      });
    }

    res.status(500).json({ error: "Erro ao criar paciente" });
  }
};

export const updatePatient = async (req, res) => {
  try {
    const clinicId = getClinicId(req);
    const { id } = req.params;

    if (!clinicId) {
      return res.status(400).json({
        error: "Usuário não está vinculado a uma clínica",
      });
    }

    const patientExists = await prisma.patient.findFirst({
      where: {
        id,
        clinicId,
      },
    });

    if (!patientExists) {
      return res.status(404).json({
        error: "Paciente não encontrado nesta clínica",
      });
    }

    const data = buildPatientData(req.body, { partial: true });
    const validationError = validatePatientData({
      ...patientExists,
      ...data,
    });

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    if (data.email) {
      const existingPatientWithEmail = await prisma.patient.findFirst({
        where: {
          email: data.email,
          clinicId,
          id: {
            not: id,
          },
        },
      });

      if (existingPatientWithEmail) {
        return res.status(409).json({
          error: "Já existe outro paciente com este e-mail nesta clínica",
        });
      }
    }

    if (data.cpf) {
      const existingPatientWithCpf = await prisma.patient.findFirst({
        where: {
          cpf: data.cpf,
          clinicId,
          id: {
            not: id,
          },
        },
      });

      if (existingPatientWithCpf) {
        return res.status(409).json({
          error: "Já existe outro paciente com este CPF nesta clínica",
        });
      }
    }

    const updatedPatient = await prisma.patient.update({
      where: {
        id,
      },
      data,
    });
    await createAuditLog({
      req,
      action: "PATIENT_UPDATED",
      entity: "Patient",
      entityId: updatedPatient.id,
      description: `Paciente atualizado: ${updatedPatient.name}`,
      metadata: {
        patientName: updatedPatient.name,
        patientEmail: updatedPatient.email,
      },
    });
    res.json(updatedPatient);
  } catch (error) {
    console.error("Erro ao atualizar paciente:", error);

    if (error.code === "P2002") {
      return res.status(409).json({
        error: "Já existe um paciente com estes dados",
      });
    }

    res.status(500).json({ error: "Erro ao atualizar paciente" });
  }
};

export const deletePatient = async (req, res) => {
  try {
    const clinicId = getClinicId(req);
    const { id } = req.params;

    if (!clinicId) {
      return res.status(400).json({
        error: "Usuário não está vinculado a uma clínica",
      });
    }

    const patientExists = await prisma.patient.findFirst({
      where: {
        id,
        clinicId,
      },
      include: {
        appointments: true,
        medicalRecord: true,
      },
    });

    if (!patientExists) {
      return res.status(404).json({
        error: "Paciente não encontrado nesta clínica",
      });
    }

    if (patientExists.appointments.length > 0 || patientExists.medicalRecord) {
      const archivedPatient = await prisma.patient.update({
        where: {
          id,
        },
        data: {
          status: "ARCHIVED",
          isActive: false,
        },
      });

      return res.json({
        message:
          "Paciente possui vínculos clínicos/agendamentos e foi arquivado em vez de excluído",
        patient: archivedPatient,
      });
    }

    await prisma.patient.delete({
      where: {
        id,
      },
    });
    await createAuditLog({
  req,
  action: "PATIENT_DELETED",
  entity: "Patient",
  entityId: id,
  description: "Paciente excluído ou arquivado",
  metadata: {
    patientId: id,
  },
});
    res.json({ message: "Paciente removido com sucesso" });
  } catch (error) {
    console.error("Erro ao remover paciente:", error);
    res.status(500).json({ error: "Erro ao remover paciente" });
  }
};
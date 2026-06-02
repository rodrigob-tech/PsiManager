import prisma from "../prisma/client.js";

const MEDICAL_RECORD_STATUSES = ["OPEN", "CLOSED", "ARCHIVED"];

const medicalRecordInclude = {
  patient: true,
  psychologist: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      clinicId: true,
    },
  },
  sessionNotes: {
    orderBy: {
      sessionDate: "desc",
    },
    include: {
      psychologist: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      appointment: {
        include: {
          patient: true,
          space: true,
          psychologist: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      },
    },
  },
};

function getClinicId(req) {
  return req.user?.clinicId || null;
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

function hasField(body, field) {
  return Object.prototype.hasOwnProperty.call(body, field);
}

function buildMedicalRecordData(body, { partial = false } = {}) {
  const data = {};

  if (!partial || hasField(body, "patientId")) {
    data.patientId = body.patientId;
  }

  if (!partial || hasField(body, "psychologistId")) {
    data.psychologistId = body.psychologistId || null;
  }

  if (!partial || hasField(body, "mainComplaint")) {
    data.mainComplaint = normalizeOptionalString(body.mainComplaint);
  }

  if (!partial || hasField(body, "diagnosisHypothesis")) {
    data.diagnosisHypothesis = normalizeOptionalString(
      body.diagnosisHypothesis
    );
  }

  if (!partial || hasField(body, "clinicalNotes")) {
    data.clinicalNotes = normalizeOptionalString(body.clinicalNotes);
  }

  if (!partial || hasField(body, "status")) {
    data.status = body.status || "OPEN";
  }

  return data;
}

function validateMedicalRecordData(data, { partial = false } = {}) {
  if (!partial && !data.patientId) {
    return "patientId é obrigatório";
  }

  if (data.status && !MEDICAL_RECORD_STATUSES.includes(data.status)) {
    return "Status do prontuário inválido";
  }

  return null;
}

async function validatePatientBelongsToClinic(patientId, clinicId) {
  if (!patientId) return null;

  return prisma.patient.findFirst({
    where: {
      id: patientId,
      clinicId,
    },
  });
}

async function validatePsychologistBelongsToClinic(psychologistId, clinicId) {
  if (!psychologistId) return null;

  return prisma.user.findFirst({
    where: {
      id: psychologistId,
      clinicId,
      role: "PSYCHOLOGIST",
      isActive: true,
    },
  });
}

export const getMedicalRecords = async (req, res) => {
  try {
    const clinicId = getClinicId(req);

    if (!clinicId) {
      return res.status(400).json({
        error: "Usuário não está vinculado a uma clínica",
      });
    }

    const medicalRecords = await prisma.medicalRecord.findMany({
      where: {
        patient: {
          clinicId,
        },
      },
      include: medicalRecordInclude,
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(medicalRecords);
  } catch (error) {
    console.error("Erro ao buscar prontuários:", error);
    res.status(500).json({ error: "Erro ao buscar prontuários" });
  }
};

export const getMedicalRecordById = async (req, res) => {
  try {
    const clinicId = getClinicId(req);
    const { id } = req.params;

    if (!clinicId) {
      return res.status(400).json({
        error: "Usuário não está vinculado a uma clínica",
      });
    }

    const medicalRecord = await prisma.medicalRecord.findFirst({
      where: {
        id,
        patient: {
          clinicId,
        },
      },
      include: medicalRecordInclude,
    });

    if (!medicalRecord) {
      return res.status(404).json({
        error: "Prontuário não encontrado nesta clínica",
      });
    }

    res.json(medicalRecord);
  } catch (error) {
    console.error("Erro ao buscar prontuário:", error);
    res.status(500).json({ error: "Erro ao buscar prontuário" });
  }
};

export const getMedicalRecordByPatientId = async (req, res) => {
  try {
    const clinicId = getClinicId(req);
    const { patientId } = req.params;

    if (!clinicId) {
      return res.status(400).json({
        error: "Usuário não está vinculado a uma clínica",
      });
    }

    const patient = await validatePatientBelongsToClinic(patientId, clinicId);

    if (!patient) {
      return res.status(404).json({
        error: "Paciente não encontrado nesta clínica",
      });
    }

    const medicalRecord = await prisma.medicalRecord.findFirst({
      where: {
        patientId,
        patient: {
          clinicId,
        },
      },
      include: medicalRecordInclude,
    });

    if (!medicalRecord) {
      return res.status(404).json({
        error: "Prontuário não encontrado para este paciente",
      });
    }

    res.json(medicalRecord);
  } catch (error) {
    console.error("Erro ao buscar prontuário do paciente:", error);
    res.status(500).json({ error: "Erro ao buscar prontuário do paciente" });
  }
};

export const createMedicalRecord = async (req, res) => {
  try {
    const clinicId = getClinicId(req);

    if (!clinicId) {
      return res.status(400).json({
        error: "Usuário não está vinculado a uma clínica",
      });
    }

    const data = buildMedicalRecordData(req.body);
    const validationError = validateMedicalRecordData(data);

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const patient = await validatePatientBelongsToClinic(
      data.patientId,
      clinicId
    );

    if (!patient) {
      return res.status(404).json({
        error: "Paciente não encontrado nesta clínica",
      });
    }

    const existingMedicalRecord = await prisma.medicalRecord.findUnique({
      where: {
        patientId: data.patientId,
      },
    });

    if (existingMedicalRecord) {
      return res.status(409).json({
        error: "Este paciente já possui prontuário",
      });
    }

    if (data.psychologistId) {
      const psychologist = await validatePsychologistBelongsToClinic(
        data.psychologistId,
        clinicId
      );

      if (!psychologist) {
        return res.status(404).json({
          error: "Psicólogo não encontrado ou inativo nesta clínica",
        });
      }
    }

    const medicalRecord = await prisma.medicalRecord.create({
      data,
      include: medicalRecordInclude,
    });

    res.status(201).json(medicalRecord);
  } catch (error) {
    console.error("Erro ao criar prontuário:", error);

    if (error.code === "P2002") {
      return res.status(409).json({
        error: "Este paciente já possui prontuário",
      });
    }

    res.status(500).json({ error: "Erro ao criar prontuário" });
  }
};

export const updateMedicalRecord = async (req, res) => {
  try {
    const clinicId = getClinicId(req);
    const { id } = req.params;

    if (!clinicId) {
      return res.status(400).json({
        error: "Usuário não está vinculado a uma clínica",
      });
    }

    const medicalRecordExists = await prisma.medicalRecord.findFirst({
      where: {
        id,
        patient: {
          clinicId,
        },
      },
      include: {
        patient: true,
      },
    });

    if (!medicalRecordExists) {
      return res.status(404).json({
        error: "Prontuário não encontrado nesta clínica",
      });
    }

    const data = buildMedicalRecordData(req.body, { partial: true });

    const validationError = validateMedicalRecordData(data, { partial: true });

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    if (hasField(req.body, "patientId") && data.patientId) {
      const patient = await validatePatientBelongsToClinic(
        data.patientId,
        clinicId
      );

      if (!patient) {
        return res.status(404).json({
          error: "Paciente não encontrado nesta clínica",
        });
      }

      const existingMedicalRecordForPatient =
        await prisma.medicalRecord.findUnique({
          where: {
            patientId: data.patientId,
          },
        });

      if (
        existingMedicalRecordForPatient &&
        existingMedicalRecordForPatient.id !== id
      ) {
        return res.status(409).json({
          error: "Este paciente já possui outro prontuário",
        });
      }
    }

    if (hasField(req.body, "psychologistId") && data.psychologistId) {
      const psychologist = await validatePsychologistBelongsToClinic(
        data.psychologistId,
        clinicId
      );

      if (!psychologist) {
        return res.status(404).json({
          error: "Psicólogo não encontrado ou inativo nesta clínica",
        });
      }
    }

    const updatedMedicalRecord = await prisma.medicalRecord.update({
      where: {
        id,
      },
      data,
      include: medicalRecordInclude,
    });

    res.json(updatedMedicalRecord);
  } catch (error) {
    console.error("Erro ao atualizar prontuário:", error);

    if (error.code === "P2002") {
      return res.status(409).json({
        error: "Este paciente já possui prontuário",
      });
    }

    res.status(500).json({ error: "Erro ao atualizar prontuário" });
  }
};

export const deleteMedicalRecord = async (req, res) => {
  try {
    const clinicId = getClinicId(req);
    const { id } = req.params;

    if (!clinicId) {
      return res.status(400).json({
        error: "Usuário não está vinculado a uma clínica",
      });
    }

    const medicalRecordExists = await prisma.medicalRecord.findFirst({
      where: {
        id,
        patient: {
          clinicId,
        },
      },
      include: {
        sessionNotes: true,
      },
    });

    if (!medicalRecordExists) {
      return res.status(404).json({
        error: "Prontuário não encontrado nesta clínica",
      });
    }

    if (medicalRecordExists.sessionNotes.length > 0) {
      const archivedMedicalRecord = await prisma.medicalRecord.update({
        where: {
          id,
        },
        data: {
          status: "ARCHIVED",
        },
        include: medicalRecordInclude,
      });

      return res.json({
        message:
          "Prontuário possui evoluções e foi arquivado em vez de excluído",
        medicalRecord: archivedMedicalRecord,
      });
    }

    await prisma.medicalRecord.delete({
      where: {
        id,
      },
    });

    res.json({ message: "Prontuário removido com sucesso" });
  } catch (error) {
    console.error("Erro ao remover prontuário:", error);
    res.status(500).json({ error: "Erro ao remover prontuário" });
  }
};
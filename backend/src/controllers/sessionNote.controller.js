import prisma from "../prisma/client.js";

const sessionNoteInclude = {
  medicalRecord: {
    include: {
      patient: true,
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
          clinicId: true,
        },
      },
    },
  },
  psychologist: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      clinicId: true,
    },
  },
};

function getClinicId(req) {
  return req.user?.clinicId || null;
}

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

function buildSessionNoteData(body, { partial = false } = {}) {
  const data = {};

  if (!partial || hasField(body, "medicalRecordId")) {
    data.medicalRecordId = body.medicalRecordId;
  }

  if (!partial || hasField(body, "appointmentId")) {
    data.appointmentId = body.appointmentId || null;
  }

  if (!partial || hasField(body, "psychologistId")) {
    data.psychologistId = body.psychologistId || null;
  }

  if (!partial || hasField(body, "sessionDate")) {
    data.sessionDate = body.sessionDate ? new Date(body.sessionDate) : new Date();
  }

  if (!partial || hasField(body, "content")) {
    data.content =
      typeof body.content === "string" ? body.content.trim() : body.content;
  }

  if (!partial || hasField(body, "conduct")) {
    data.conduct = normalizeOptionalString(body.conduct);
  }

  if (!partial || hasField(body, "privateNotes")) {
    data.privateNotes = normalizeOptionalString(body.privateNotes);
  }

  return data;
}

function validateSessionNoteData(data, { partial = false } = {}) {
  if (!partial && !data.medicalRecordId) {
    return "medicalRecordId é obrigatório";
  }

  if (!partial && !data.content) {
    return "Conteúdo da evolução é obrigatório";
  }

  if (hasField(data, "content") && data.content !== undefined && !data.content) {
    return "Conteúdo da evolução é obrigatório";
  }

  if (data.sessionDate && Number.isNaN(data.sessionDate.getTime())) {
    return "Data da sessão inválida";
  }

  return null;
}

async function validateMedicalRecordBelongsToClinic(medicalRecordId, clinicId) {
  if (!medicalRecordId) return null;

  return prisma.medicalRecord.findFirst({
    where: {
      id: medicalRecordId,
      patient: {
        clinicId,
      },
    },
    include: {
      patient: true,
    },
  });
}

async function validateAppointmentBelongsToClinic(appointmentId, clinicId) {
  if (!appointmentId) return null;

  return prisma.appointment.findFirst({
    where: {
      id: appointmentId,
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

export const getSessionNotes = async (req, res) => {
  try {
    const clinicId = getClinicId(req);

    if (!clinicId) {
      return res.status(400).json({
        error: "Usuário não está vinculado a uma clínica",
      });
    }

    const sessionNotes = await prisma.sessionNote.findMany({
      where: {
        medicalRecord: {
          patient: {
            clinicId,
          },
        },
      },
      include: sessionNoteInclude,
      orderBy: {
        sessionDate: "desc",
      },
    });

    res.json(sessionNotes);
  } catch (error) {
    console.error("Erro ao buscar evoluções:", error);
    res.status(500).json({ error: "Erro ao buscar evoluções" });
  }
};

export const getSessionNoteById = async (req, res) => {
  try {
    const clinicId = getClinicId(req);
    const { id } = req.params;

    if (!clinicId) {
      return res.status(400).json({
        error: "Usuário não está vinculado a uma clínica",
      });
    }

    const sessionNote = await prisma.sessionNote.findFirst({
      where: {
        id,
        medicalRecord: {
          patient: {
            clinicId,
          },
        },
      },
      include: sessionNoteInclude,
    });

    if (!sessionNote) {
      return res.status(404).json({
        error: "Evolução não encontrada nesta clínica",
      });
    }

    res.json(sessionNote);
  } catch (error) {
    console.error("Erro ao buscar evolução:", error);
    res.status(500).json({ error: "Erro ao buscar evolução" });
  }
};

export const getSessionNotesByMedicalRecordId = async (req, res) => {
  try {
    const clinicId = getClinicId(req);
    const { medicalRecordId } = req.params;

    if (!clinicId) {
      return res.status(400).json({
        error: "Usuário não está vinculado a uma clínica",
      });
    }

    const medicalRecord = await validateMedicalRecordBelongsToClinic(
      medicalRecordId,
      clinicId
    );

    if (!medicalRecord) {
      return res.status(404).json({
        error: "Prontuário não encontrado nesta clínica",
      });
    }

    const sessionNotes = await prisma.sessionNote.findMany({
      where: {
        medicalRecordId,
        medicalRecord: {
          patient: {
            clinicId,
          },
        },
      },
      include: sessionNoteInclude,
      orderBy: {
        sessionDate: "desc",
      },
    });

    res.json(sessionNotes);
  } catch (error) {
    console.error("Erro ao buscar evoluções do prontuário:", error);
    res.status(500).json({ error: "Erro ao buscar evoluções do prontuário" });
  }
};

export const createSessionNote = async (req, res) => {
  try {
    const clinicId = getClinicId(req);

    if (!clinicId) {
      return res.status(400).json({
        error: "Usuário não está vinculado a uma clínica",
      });
    }

    const data = buildSessionNoteData(req.body);
    const validationError = validateSessionNoteData(data);

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const medicalRecord = await validateMedicalRecordBelongsToClinic(
      data.medicalRecordId,
      clinicId
    );

    if (!medicalRecord) {
      return res.status(404).json({
        error: "Prontuário não encontrado nesta clínica",
      });
    }

    if (data.appointmentId) {
      const appointment = await validateAppointmentBelongsToClinic(
        data.appointmentId,
        clinicId
      );

      if (!appointment) {
        return res.status(404).json({
          error: "Agendamento não encontrado nesta clínica",
        });
      }

      if (appointment.patientId !== medicalRecord.patientId) {
        return res.status(400).json({
          error:
            "O agendamento informado não pertence ao mesmo paciente do prontuário",
        });
      }
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

    const sessionNote = await prisma.sessionNote.create({
      data,
      include: sessionNoteInclude,
    });

    res.status(201).json(sessionNote);
  } catch (error) {
    console.error("Erro ao criar evolução:", error);
    res.status(500).json({ error: "Erro ao criar evolução" });
  }
};

export const updateSessionNote = async (req, res) => {
  try {
    const clinicId = getClinicId(req);
    const { id } = req.params;

    if (!clinicId) {
      return res.status(400).json({
        error: "Usuário não está vinculado a uma clínica",
      });
    }

    const sessionNoteExists = await prisma.sessionNote.findFirst({
      where: {
        id,
        medicalRecord: {
          patient: {
            clinicId,
          },
        },
      },
      include: {
        medicalRecord: true,
      },
    });

    if (!sessionNoteExists) {
      return res.status(404).json({
        error: "Evolução não encontrada nesta clínica",
      });
    }

    const data = buildSessionNoteData(req.body, { partial: true });
    const validationError = validateSessionNoteData(data, { partial: true });

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const finalMedicalRecordId =
      data.medicalRecordId || sessionNoteExists.medicalRecordId;

    const medicalRecord = await validateMedicalRecordBelongsToClinic(
      finalMedicalRecordId,
      clinicId
    );

    if (!medicalRecord) {
      return res.status(404).json({
        error: "Prontuário não encontrado nesta clínica",
      });
    }

    const finalAppointmentId =
      data.appointmentId !== undefined
        ? data.appointmentId
        : sessionNoteExists.appointmentId;

    if (finalAppointmentId) {
      const appointment = await validateAppointmentBelongsToClinic(
        finalAppointmentId,
        clinicId
      );

      if (!appointment) {
        return res.status(404).json({
          error: "Agendamento não encontrado nesta clínica",
        });
      }

      if (appointment.patientId !== medicalRecord.patientId) {
        return res.status(400).json({
          error:
            "O agendamento informado não pertence ao mesmo paciente do prontuário",
        });
      }
    }

    const finalPsychologistId =
      data.psychologistId !== undefined
        ? data.psychologistId
        : sessionNoteExists.psychologistId;

    if (finalPsychologistId) {
      const psychologist = await validatePsychologistBelongsToClinic(
        finalPsychologistId,
        clinicId
      );

      if (!psychologist) {
        return res.status(404).json({
          error: "Psicólogo não encontrado ou inativo nesta clínica",
        });
      }
    }

    const updatedSessionNote = await prisma.sessionNote.update({
      where: {
        id,
      },
      data,
      include: sessionNoteInclude,
    });

    res.json(updatedSessionNote);
  } catch (error) {
    console.error("Erro ao atualizar evolução:", error);
    res.status(500).json({ error: "Erro ao atualizar evolução" });
  }
};

export const deleteSessionNote = async (req, res) => {
  try {
    const clinicId = getClinicId(req);
    const { id } = req.params;

    if (!clinicId) {
      return res.status(400).json({
        error: "Usuário não está vinculado a uma clínica",
      });
    }

    const sessionNoteExists = await prisma.sessionNote.findFirst({
      where: {
        id,
        medicalRecord: {
          patient: {
            clinicId,
          },
        },
      },
    });

    if (!sessionNoteExists) {
      return res.status(404).json({
        error: "Evolução não encontrada nesta clínica",
      });
    }

    await prisma.sessionNote.delete({
      where: {
        id,
      },
    });

    res.json({ message: "Evolução removida com sucesso" });
  } catch (error) {
    console.error("Erro ao remover evolução:", error);
    res.status(500).json({ error: "Erro ao remover evolução" });
  }
};
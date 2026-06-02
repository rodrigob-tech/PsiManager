import prisma from "../prisma/client.js";
import { sendEmail } from "../services/email.service.js";
import {
  createGoogleCalendarEvent,
  updateGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
} from "../services/googleCalendar.service.js";
import { validatePublicBookingRules } from "../services/availability.service.js";

const validStatuses = ["scheduled", "confirmed", "pending", "canceled", "done"];

const appointmentInclude = {
  patient: true,
  space: true,
  payment: true,
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

function validateStatus(status) {
  if (status && !validStatuses.includes(status)) {
    return "Status inválido";
  }

  return null;
}

function parseAppointmentDate(date) {
  if (!date) return null;

  const appointmentDate = new Date(date);

  if (Number.isNaN(appointmentDate.getTime())) {
    return null;
  }

  return appointmentDate;
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

async function validateSpaceBelongsToClinic(spaceId, clinicId) {
  if (!spaceId) return null;

  return prisma.space.findFirst({
    where: {
      id: spaceId,
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

export const getAppointments = async (req, res) => {
  try {
    const clinicId = getClinicId(req);

    if (!clinicId) {
      return res.status(400).json({
        error: "Usuário não está vinculado a uma clínica",
      });
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        clinicId,
      },
      include: appointmentInclude,
      orderBy: {
        date: "asc",
      },
    });

    res.json(appointments);
  } catch (error) {
    console.error("Erro ao buscar agendamentos:", error);
    res.status(500).json({ error: "Erro ao buscar agendamentos" });
  }
};

export const getAppointmentById = async (req, res) => {
  try {
    const clinicId = getClinicId(req);
    const { id } = req.params;

    if (!clinicId) {
      return res.status(400).json({
        error: "Usuário não está vinculado a uma clínica",
      });
    }

    const appointment = await prisma.appointment.findFirst({
      where: {
        id,
        clinicId,
      },
      include: appointmentInclude,
    });

    if (!appointment) {
      return res.status(404).json({
        error: "Agendamento não encontrado nesta clínica",
      });
    }

    res.json(appointment);
  } catch (error) {
    console.error("Erro ao buscar agendamento:", error);
    res.status(500).json({ error: "Erro ao buscar agendamento" });
  }
};

export const createAppointment = async (req, res) => {
  try {
    const clinicId = getClinicId(req);
    const { date, status, patientId, spaceId, psychologistId } = req.body;

    if (!clinicId) {
      return res.status(400).json({
        error: "Usuário não está vinculado a uma clínica",
      });
    }

    if (!date || !patientId || !spaceId) {
      return res.status(400).json({
        error: "date, patientId e spaceId são obrigatórios",
      });
    }

    const statusError = validateStatus(status);
    if (statusError) {
      return res.status(400).json({ error: statusError });
    }

    const appointmentDate = parseAppointmentDate(date);
    if (!appointmentDate) {
      return res.status(400).json({ error: "Data inválida" });
    }

    const patient = await validatePatientBelongsToClinic(patientId, clinicId);
    if (!patient) {
      return res.status(404).json({
        error: "Paciente não encontrado nesta clínica",
      });
    }

    const space = await validateSpaceBelongsToClinic(spaceId, clinicId);
    if (!space) {
      return res.status(404).json({
        error: "Espaço não encontrado nesta clínica",
      });
    }

    if (psychologistId) {
      const psychologist = await validatePsychologistBelongsToClinic(
        psychologistId,
        clinicId
      );

      if (!psychologist) {
        return res.status(404).json({
          error: "Psicólogo não encontrado ou inativo nesta clínica",
        });
      }
    }

    await validatePublicBookingRules({
      date,
      spaceId,
    });

    const blockedTime = await prisma.blockedTime.findFirst({
      where: {
        clinicId,
        start: {
          lte: appointmentDate,
        },
        end: {
          gte: appointmentDate,
        },
      },
    });

    if (blockedTime) {
      return res.status(400).json({
        error: "Este horário está bloqueado",
      });
    }

    const conflictingSpaceAppointment = await prisma.appointment.findFirst({
      where: {
        clinicId,
        date: appointmentDate,
        spaceId,
      },
    });

    if (conflictingSpaceAppointment) {
      return res.status(400).json({
        error: "Já existe um agendamento neste horário para este espaço",
      });
    }

    if (psychologistId) {
      const conflictingPsychologistAppointment =
        await prisma.appointment.findFirst({
          where: {
            clinicId,
            date: appointmentDate,
            psychologistId,
          },
        });

      if (conflictingPsychologistAppointment) {
        return res.status(400).json({
          error: "Este psicólogo já possui um agendamento neste horário",
        });
      }
    }

    const appointment = await prisma.appointment.create({
      data: {
        clinicId,
        date: appointmentDate,
        status: status || "scheduled",
        patientId,
        spaceId,
        psychologistId: psychologistId || null,
      },
      include: appointmentInclude,
    });

    try {
      if (appointment.patient?.email) {
        await sendEmail({
          to: appointment.patient.email,
          subject: "Agendamento confirmado",
          text: `Olá, ${appointment.patient.name}.
Seu agendamento foi criado para ${new Date(
            appointment.date
          ).toLocaleString("pt-BR")}.
Espaço: ${appointment.space?.name || "Não informado"}.
Status: ${appointment.status}.`,
        });
      }
    } catch (emailError) {
      console.error("Erro ao enviar email de criação:", emailError);
    }

    try {
      const googleEvent = await createGoogleCalendarEvent(
        req.user.userId,
        appointment
      );

      await prisma.appointment.update({
        where: {
          id: appointment.id,
        },
        data: {
          googleEventId: googleEvent.id || null,
          googleCalendarId: "primary",
          googleSyncStatus: "synced",
          googleSyncError: null,
          syncedAt: new Date(),
        },
      });
    } catch (googleError) {
      console.error("Erro ao sincronizar com Google Calendar:", googleError);

      await prisma.appointment.update({
        where: {
          id: appointment.id,
        },
        data: {
          googleSyncStatus: "failed",
          googleSyncError: googleError.message,
        },
      });
    }

    const updatedAppointment = await prisma.appointment.findFirst({
      where: {
        id: appointment.id,
        clinicId,
      },
      include: appointmentInclude,
    });

    res.status(201).json(updatedAppointment);
  } catch (error) {
    console.error("Erro ao criar agendamento:", error);
    res.status(500).json({ error: "Erro ao criar agendamento" });
  }
};

export const updateAppointment = async (req, res) => {
  try {
    const clinicId = getClinicId(req);
    const { id } = req.params;
    const { date, status, patientId, spaceId, psychologistId } = req.body;

    if (!clinicId) {
      return res.status(400).json({
        error: "Usuário não está vinculado a uma clínica",
      });
    }

    const appointmentExists = await prisma.appointment.findFirst({
      where: {
        id,
        clinicId,
      },
      include: appointmentInclude,
    });

    if (!appointmentExists) {
      return res.status(404).json({
        error: "Agendamento não encontrado nesta clínica",
      });
    }

    const statusError = validateStatus(status);
    if (statusError) {
      return res.status(400).json({ error: statusError });
    }

    const finalDate = date ? parseAppointmentDate(date) : appointmentExists.date;

    if (!finalDate) {
      return res.status(400).json({ error: "Data inválida" });
    }

    const finalPatientId =
      patientId !== undefined ? patientId : appointmentExists.patientId;

    const finalSpaceId =
      spaceId !== undefined ? spaceId : appointmentExists.spaceId;

    const finalPsychologistId =
      psychologistId !== undefined
        ? psychologistId || null
        : appointmentExists.psychologistId;

    if (!finalPatientId || !finalSpaceId) {
      return res.status(400).json({
        error: "patientId e spaceId são obrigatórios",
      });
    }

    const patient = await validatePatientBelongsToClinic(
      finalPatientId,
      clinicId
    );

    if (!patient) {
      return res.status(404).json({
        error: "Paciente não encontrado nesta clínica",
      });
    }

    const space = await validateSpaceBelongsToClinic(finalSpaceId, clinicId);

    if (!space) {
      return res.status(404).json({
        error: "Espaço não encontrado nesta clínica",
      });
    }

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

    const blockedTime = await prisma.blockedTime.findFirst({
      where: {
        clinicId,
        start: {
          lte: finalDate,
        },
        end: {
          gte: finalDate,
        },
      },
    });

    if (blockedTime) {
      return res.status(400).json({
        error: "Este horário está bloqueado",
      });
    }

    const conflictingSpaceAppointment = await prisma.appointment.findFirst({
      where: {
        id: {
          not: id,
        },
        clinicId,
        date: finalDate,
        spaceId: finalSpaceId,
      },
    });

    if (conflictingSpaceAppointment) {
      return res.status(400).json({
        error: "Já existe um agendamento neste horário para este espaço",
      });
    }

    if (finalPsychologistId) {
      const conflictingPsychologistAppointment =
        await prisma.appointment.findFirst({
          where: {
            id: {
              not: id,
            },
            clinicId,
            date: finalDate,
            psychologistId: finalPsychologistId,
          },
        });

      if (conflictingPsychologistAppointment) {
        return res.status(400).json({
          error: "Este psicólogo já possui um agendamento neste horário",
        });
      }
    }

    const updatedAppointment = await prisma.appointment.update({
      where: {
        id,
      },
      data: {
        ...(date !== undefined && { date: finalDate }),
        ...(status !== undefined && { status }),
        ...(patientId !== undefined && { patientId: finalPatientId }),
        ...(spaceId !== undefined && { spaceId: finalSpaceId }),
        ...(psychologistId !== undefined && {
          psychologistId: finalPsychologistId,
        }),
      },
      include: appointmentInclude,
    });

    try {
      if (updatedAppointment.googleEventId) {
        await updateGoogleCalendarEvent(req.user.userId, updatedAppointment);

        await prisma.appointment.update({
          where: {
            id: updatedAppointment.id,
          },
          data: {
            googleSyncStatus: "synced",
            googleSyncError: null,
            syncedAt: new Date(),
          },
        });
      }
    } catch (googleError) {
      console.error("Erro ao atualizar evento no Google Calendar:", googleError);

      await prisma.appointment.update({
        where: {
          id: updatedAppointment.id,
        },
        data: {
          googleSyncStatus: "failed",
          googleSyncError: googleError.message,
        },
      });
    }

    const finalAppointment = await prisma.appointment.findFirst({
      where: {
        id: updatedAppointment.id,
        clinicId,
      },
      include: appointmentInclude,
    });

    res.json(finalAppointment);
  } catch (error) {
    console.error("Erro ao atualizar agendamento:", error);
    res.status(500).json({ error: "Erro ao atualizar agendamento" });
  }
};

export const deleteAppointment = async (req, res) => {
  try {
    const clinicId = getClinicId(req);
    const { id } = req.params;

    if (!clinicId) {
      return res.status(400).json({
        error: "Usuário não está vinculado a uma clínica",
      });
    }

    const appointmentExists = await prisma.appointment.findFirst({
      where: {
        id,
        clinicId,
      },
      include: appointmentInclude,
    });

    if (!appointmentExists) {
      return res.status(404).json({
        error: "Agendamento não encontrado nesta clínica",
      });
    }

    try {
      if (appointmentExists.googleEventId) {
        await deleteGoogleCalendarEvent(req.user.userId, appointmentExists);
      }
    } catch (googleError) {
      console.error("Erro ao excluir evento no Google Calendar:", googleError);
    }

    await prisma.appointment.delete({
      where: {
        id,
      },
    });

    res.json({ message: "Agendamento removido com sucesso" });
  } catch (error) {
    console.error("Erro ao remover agendamento:", error);
    res.status(500).json({ error: "Erro ao remover agendamento" });
  }
};
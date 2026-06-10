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
    const clinicId = req.user?.clinicId;

    if (!clinicId) {
      return res.status(400).json({
        error: "Usuário não está vinculado a uma clínica",
      });
    }

    const { date, status, patientId, spaceId, psychologistId } = req.body;

    if (!date || !patientId || !spaceId) {
      return res.status(400).json({
        error: "Data, paciente e espaço são obrigatórios",
      });
    }

    const appointmentDate = new Date(date);

    if (Number.isNaN(appointmentDate.getTime())) {
      return res.status(400).json({
        error: "Data do agendamento inválida",
      });
    }

    let finalPsychologistId = psychologistId || null;

    if (req.user.role === "PSYCHOLOGIST") {
      finalPsychologistId = req.user.id;
    }

    const patient = await prisma.patient.findFirst({
      where: {
        id: patientId,
        clinicId,
      },
    });

    if (!patient) {
      return res.status(404).json({
        error: "Paciente não encontrado nesta clínica",
      });
    }

    const space = await prisma.space.findFirst({
      where: {
        id: spaceId,
        clinicId,
      },
    });

    if (!space) {
      return res.status(404).json({
        error: "Espaço não encontrado nesta clínica",
      });
    }

    if (finalPsychologistId) {
      const psychologist = await prisma.user.findFirst({
        where: {
          id: finalPsychologistId,
          clinicId,
          role: "PSYCHOLOGIST",
          isActive: true,
        },
      });

      if (!psychologist) {
        return res.status(404).json({
          error: "Psicólogo não encontrado ou inativo nesta clínica",
        });
      }
    }

    const conflictingPatientAppointment = await prisma.appointment.findFirst({
      where: {
        clinicId,
        patientId,
        date: appointmentDate,
        
      },
    });

    if (conflictingPatientAppointment) {
      return res.status(400).json({
        error: "Este paciente já possui um agendamento neste horário",
      });
    }

    const conflictingSpaceAppointment = await prisma.appointment.findFirst({
      where: {
        clinicId,
        spaceId,
        date: appointmentDate,
        
      },
    });

    if (conflictingSpaceAppointment) {
      return res.status(400).json({
        error: "Este espaço já possui um agendamento neste horário",
      });
    }

    if (finalPsychologistId) {
      const conflictingPsychologistAppointment =
        await prisma.appointment.findFirst({
          where: {
            clinicId,
            psychologistId: finalPsychologistId,
            date: appointmentDate,
            
          },
        });

      if (conflictingPsychologistAppointment) {
        return res.status(400).json({
          error: "Este psicólogo já possui um agendamento neste horário",
        });
      }
    }

    const blockedTimeConflict = await prisma.blockedTime.findFirst({
      where: {
        clinicId,
        OR: [
          {
            spaceId,
          },
          {
            spaceId: null,
          },
        ],
        start: {
          lte: appointmentDate,
        },
        end: {
          gt: appointmentDate,
        },
      },
    });

    if (blockedTimeConflict) {
      return res.status(400).json({
        error: "Este horário está bloqueado",
      });
    }

    const appointment = await prisma.appointment.create({
      data: {
        clinicId,
        date: appointmentDate,
        status: status || "scheduled",
        patientId,
        spaceId,
        psychologistId: finalPsychologistId,
      },
      include: appointmentInclude,
    });

    return res.status(201).json(appointment);
  } catch (error) {
    console.error("Erro ao criar agendamento:", error);

    return res.status(500).json({
      error: "Erro ao criar agendamento",
    });
  }
};

export const updateAppointment = async (req, res) => {
  try {
    const clinicId = req.user?.clinicId;
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
    });

    if (!appointmentExists) {
      return res.status(404).json({
        error: "Agendamento não encontrado nesta clínica",
      });
    }

    const { date, status, patientId, spaceId, psychologistId } = req.body;

    let finalDate = appointmentExists.date;

    if (date !== undefined) {
      finalDate = new Date(date);

      if (Number.isNaN(finalDate.getTime())) {
        return res.status(400).json({
          error: "Data do agendamento inválida",
        });
      }
    }

    const finalPatientId =
      patientId !== undefined ? patientId : appointmentExists.patientId;

    const finalSpaceId =
      spaceId !== undefined ? spaceId : appointmentExists.spaceId;

    let finalPsychologistId =
      psychologistId !== undefined
        ? psychologistId || null
        : appointmentExists.psychologistId;

    if (req.user.role === "PSYCHOLOGIST") {
      finalPsychologistId = req.user.id;
    }

    const patient = await prisma.patient.findFirst({
      where: {
        id: finalPatientId,
        clinicId,
      },
    });

    if (!patient) {
      return res.status(404).json({
        error: "Paciente não encontrado nesta clínica",
      });
    }

    const space = await prisma.space.findFirst({
      where: {
        id: finalSpaceId,
        clinicId,
      },
    });

    if (!space) {
      return res.status(404).json({
        error: "Espaço não encontrado nesta clínica",
      });
    }

    if (finalPsychologistId) {
      const psychologist = await prisma.user.findFirst({
        where: {
          id: finalPsychologistId,
          clinicId,
          role: "PSYCHOLOGIST",
          isActive: true,
        },
      });

      if (!psychologist) {
        return res.status(404).json({
          error: "Psicólogo não encontrado ou inativo nesta clínica",
        });
      }
    }

    const conflictingPatientAppointment = await prisma.appointment.findFirst({
      where: {
        id: {
          not: id,
        },
        clinicId,
        patientId: finalPatientId,
        date: finalDate,
        
      },
    });

    if (conflictingPatientAppointment) {
      return res.status(400).json({
        error: "Este paciente já possui um agendamento neste horário",
      });
    }

    const conflictingSpaceAppointment = await prisma.appointment.findFirst({
      where: {
        id: {
          not: id,
        },
        clinicId,
        spaceId: finalSpaceId,
        date: finalDate,
        
      },
    });

    if (conflictingSpaceAppointment) {
      return res.status(400).json({
        error: "Este espaço já possui um agendamento neste horário",
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
            psychologistId: finalPsychologistId,
            date: finalDate,
            
          },
        });

      if (conflictingPsychologistAppointment) {
        return res.status(400).json({
          error: "Este psicólogo já possui um agendamento neste horário",
        });
      }
    }

    const blockedTimeConflict = await prisma.blockedTime.findFirst({
      where: {
        clinicId,
        OR: [
          {
            spaceId: finalSpaceId,
          },
          {
            spaceId: null,
          },
        ],
        start: {
          lte: finalDate,
        },
        end: {
          gt: finalDate,
        },
      },
    });

    if (blockedTimeConflict) {
      return res.status(400).json({
        error: "Este horário está bloqueado",
      });
    }

    const updatedAppointment = await prisma.appointment.update({
      where: {
        id,
      },
      data: {
        date: finalDate,
        status: status !== undefined ? status : appointmentExists.status,
        patientId: finalPatientId,
        spaceId: finalSpaceId,
        psychologistId: finalPsychologistId,
      },
      include: appointmentInclude,
    });

    return res.json(updatedAppointment);
  } catch (error) {
    console.error("Erro ao atualizar agendamento:", error);

    return res.status(500).json({
      error: "Erro ao atualizar agendamento",
    });
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
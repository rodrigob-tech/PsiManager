import prisma from "../prisma/client.js";
import { sendEmail } from "../services/email.service.js";
import {
  createGoogleCalendarEvent,
  updateGoogleCalendarEvent,
  deleteGoogleCalendarEvent
} from "../services/googleCalendar.service.js";
import { validatePublicBookingRules } from "../services/availability.service.js";

export const getAppointments = async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        client: true,
        space: true
      },
      orderBy: {
        date: "asc"
      }
    });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar agendamentos" });
  }
};

export const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        client: true,
        space: true
      }
    });

    if (!appointment) {
      return res.status(404).json({ error: "Agendamento não encontrado" });
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar agendamento" });
  }
};
export const createAppointment = async (req, res) => {
  try {
    const { date, status, clientId, spaceId } = req.body;
    // Validação  de data, clientID, space ID
    if (!date || !clientId || !spaceId) {
      return res.status(400).json({
        error: "date, clientId e spaceId são obrigatórios"
      });
    }
    // Validação  dos status
    const validStatuses = ["scheduled", "confirmed", "pending", "canceled", "done"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: "Status inválido" });
    }
    // Validação  data do appointment
    const appointmentDate = new Date(date);

    if (isNaN(appointmentDate.getTime())) {
      return res.status(400).json({ error: "Data inválida" });
    }
    // Validando se o cliente existe no DB
    const clientExists = await prisma.client.findUnique({
      where: { id: clientId }
    });

    if (!clientExists) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    // Validando  se o spaceID existe no DB
    if (spaceId) {
      const spaceExists = await prisma.space.findUnique({
        where: { id: spaceId }
      });

      if (!spaceExists) {
        return res.status(404).json({ error: "Espaço não encontrado" });
      }
    }

    await validatePublicBookingRules({ date, spaceId });
    // verificando se o horário é um dos bloqueados
    const blockedTime = await prisma.blockedTime.findFirst({
      where: {
        start: {
          lte: appointmentDate
        },
        end: {
          gte: appointmentDate
        }
      }
    });

    if (blockedTime) {
      return res.status(400).json({
        error: "Este horário está bloqueado"
      });
    }
    // verificando se ja existe um agendamento naquela sala no mesmo horário
    if (spaceId) {
      const conflictingAppointment = await prisma.appointment.findFirst({
        where: {
          date: appointmentDate,
          spaceId: spaceId
        }
      });

      if (conflictingAppointment) {
        return res.status(400).json({
          error: "Já existe um agendamento neste horário para este espaço"
        });
      }
    }

    // criando o agendamento no db
    const appointment = await prisma.appointment.create({
      data: {
        date: appointmentDate,
        status: status || "scheduled",
        clientId,
        // tava spaceId: spaceId
        spaceId
      },
      include: {
        client: true,
        space: true
      }
    });
    try {
      // usando um job do Bree para enviar o email
      if (appointment.client?.email) {
        await sendEmail({
          to: appointment.client.email,
          subject: "Agendamento confirmado",
          text: `Olá, ${appointment.client.name}. Seu agendamento foi criado para ${new Date(
            appointment.date
          ).toLocaleString("pt-BR")}. Espaço: ${appointment.space?.name || "Não informado"
            }. Status: ${appointment.status}.`
        });
      }
    } catch (emailError) {
      console.error("Erro ao enviar email de criação:", emailError);
    }
    try {

      // Criando um evento no google calendar
      const googleEvent = await createGoogleCalendarEvent(
        req.user.userId,
        appointment
      );

      await prisma.appointment.update({
        where: { id: appointment.id },
        data: {
          googleEventId: googleEvent.id || null,
          googleCalendarId: "primary",
          googleSyncStatus: "synced",
          googleSyncError: null,
          syncedAt: new Date()
        }
      });
    } catch (googleError) {
      console.error("Erro ao sincronizar com Google Calendar:", googleError);

      await prisma.appointment.update({
        where: { id: appointment.id },
        data: {
          googleSyncStatus: "failed",
          googleSyncError: googleError.message
        }
      });
    }
    // atualizando o appointment com as info do googleEvent
    const updatedAppointment = await prisma.appointment.findUnique({
      where: { id: appointment.id },
      include: {
        client: true,
        space: true
      }
    });

    res.status(201).json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar agendamento" });
  }
};
export const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, status, clientId, spaceId } = req.body;

    const appointmentExists = await prisma.appointment.findUnique({
      where: { id },
      include: {
        client: true,
        space: true
      }
    });

    if (!appointmentExists) {
      return res.status(404).json({ error: "Agendamento não encontrado" });
    }

    if (clientId) {
      const clientExists = await prisma.client.findUnique({
        where: { id: clientId }
      });

      if (!clientExists) {
        return res.status(404).json({ error: "Cliente não encontrado" });
      }
    }

    if (spaceId) {
      const spaceExists = await prisma.space.findUnique({
        where: { id: spaceId }
      });

      if (!spaceExists) {
        return res.status(404).json({ error: "Espaço não encontrado" });
      }
    }

    const finalDate = date ? new Date(date) : appointmentExists.date;
    const finalSpaceId =
      spaceId !== undefined ? (spaceId || null) : appointmentExists.spaceId;

    if (!finalSpaceId) {
      return res.status(400).json({
        error: "spaceId é obrigatório"
      });
    }

    const blockedTime = await prisma.blockedTime.findFirst({
      where: {
        start: {
          lte: finalDate
        },
        end: {
          gte: finalDate
        }
      }
    });

    if (blockedTime) {
      return res.status(400).json({
        error: "Este horário está bloqueado"
      });
    }

    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        id: {
          not: id
        },
        date: finalDate,
        spaceId: finalSpaceId
      }
    });

    if (conflictingAppointment) {
      return res.status(400).json({
        error: "Já existe um agendamento neste horário para este espaço"
      });
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        ...(date && { date: new Date(date) }),
        ...(status && { status }),
        ...(clientId && { clientId }),
        ...(spaceId !== undefined && { spaceId: spaceId || null })
      },
      include: {
        client: true,
        space: true
      }
    });

    try {


      if (updatedAppointment.googleEventId) {
        await updateGoogleCalendarEvent(
          req.user.userId,
          updatedAppointment
        );

        await prisma.appointment.update({
          where: { id: updatedAppointment.id },
          data: {
            googleSyncStatus: "synced",
            googleSyncError: null,
            syncedAt: new Date()
          }
        });
      }
    } catch (googleError) {
      console.error("Erro ao atualizar evento no Google Calendar:", googleError);

      await prisma.appointment.update({
        where: { id: updatedAppointment.id },
        data: {
          googleSyncStatus: "failed",
          googleSyncError: googleError.message
        }
      });
    }

    const finalAppointment = await prisma.appointment.findUnique({
      where: { id: updatedAppointment.id },
      include: {
        client: true,
        space: true
      }
    });

    res.json(finalAppointment);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar agendamento" });
  }
};

export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointmentExists = await prisma.appointment.findUnique({
      where: { id },
      include: {
        client: true,
        space: true
      }
    });

    if (!appointmentExists) {
      return res.status(404).json({ error: "Agendamento não encontrado" });
    }

    try {
      const GOOGLE_OWNER_USER_ID = "2ec5f4e3-6517-4f68-b968-2e496a3eb972";

      if (appointmentExists.googleEventId) {
        await deleteGoogleCalendarEvent(
          req.user.userId,
          appointmentExists
        );
      }
    } catch (googleError) {
      console.error("Erro ao excluir evento no Google Calendar:", googleError);
    }

    await prisma.appointment.delete({
      where: { id }
    });

    res.json({ message: "Agendamento removido com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao remover agendamento" });
  }
};
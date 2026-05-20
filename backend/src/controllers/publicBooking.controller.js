import prisma from "../prisma/client.js";
import { getAvailableSlots, validatePublicBookingRules } from "../services/availability.service.js";
import { sendEmail } from "../services/email.service.js";
import { createGoogleCalendarEvent } from "../services/googleCalendar.service.js";

export const getPublicAvailableSlots = async (req, res) => {
  try {
    const { date, spaceId } = req.query;

    if (!date || !spaceId) {
      return res.status(400).json({
        error: "date e spaceId são obrigatórios"
      });
    }

    const slots = await getAvailableSlots({ date, spaceId });

    res.json({
      date,
      spaceId,
      slots
    });
  } catch (error) {
    res.status(400).json({
      error: error.message || "Erro ao buscar horários disponíveis"
    });
  }
};


export const createPublicBooking = async (req, res) => {
  try {
    const { date, spaceId } = req.body;
    const clientId = req.client.clientId;

    if (!date || !spaceId) {
      return res.status(400).json({
        error: "date e spaceId são obrigatórios"
      });
    }

    const client = await prisma.client.findUnique({
      where: { id: clientId }
    });

    if (!client || !client.isActive) {
      return res.status(403).json({
        error: "Cliente autenticado inválido ou inativo"
      });
    }

    await validatePublicBookingRules({ date, spaceId });

    const appointment = await prisma.appointment.create({
      data: {
        date: new Date(date),
        status: "scheduled",
        clientId: client.id,
        spaceId
      },
      include: {
        client: true,
        space: true
      }
    });

    try {
      await sendEmail({
        to: appointment.client.email,
        subject: "Agendamento confirmado",
        text: `Olá, ${appointment.client.name}. Seu agendamento foi confirmado para ${new Date(
          appointment.date
        ).toLocaleString("pt-BR")}. Espaço: ${
          appointment.space?.name || "Não informado"
        }.`
      });
    } catch (emailError) {
      console.error("Erro ao enviar email do agendamento autenticado:", emailError);
    }

    try {
      

      const googleEvent = await createGoogleCalendarEvent(
        process.env.DEFAULT_OWNER_USER_ID ,
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
      console.error("Erro ao sincronizar agendamento autenticado no Google:", googleError);

      await prisma.appointment.update({
        where: { id: appointment.id },
        data: {
          googleSyncStatus: "failed",
          googleSyncError: googleError.message
        }
      });
    }

    const finalAppointment = await prisma.appointment.findUnique({
      where: { id: appointment.id },
      include: {
        client: true,
        space: true
      }
    });

    res.status(201).json(finalAppointment);
  } catch (error) {
    res.status(400).json({
      error: error.message || "Erro ao criar agendamento autenticado"
    });
  }
};

export const getPublicSpaces = async (req, res) => {
  try {
    const spaces = await prisma.space.findMany({
      orderBy: {
        name: "asc"
      }
    });

    res.json(spaces);
  } catch (error) {
    console.error("Erro ao buscar espaços públicos:", error);
    res.status(500).json({
      error: "Erro ao buscar espaços"
    });
  }
};
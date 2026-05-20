import prisma from "../prisma/client.js";
import { deleteGoogleCalendarEvent } from "../services/googleCalendar.service.js";

export const getMyAppointments = async (req, res) => {
  try {
    const clientId = req.client.clientId;

    const appointments = await prisma.appointment.findMany({
      where: {
        clientId
      },
      include: {
        space: true
      },
      orderBy: {
        date: "asc"
      }
    });

    res.json(appointments);
  } catch (error) {
    console.error("Erro ao buscar agendamentos do cliente:", error);
    res.status(500).json({
      error: "Erro ao buscar agendamentos do cliente"
    });
  }
};

export const cancelMyAppointment = async (req, res) => {
  try {
    const clientId = req.client.clientId;
    const { id } = req.params;

    const appointment = await prisma.appointment.findFirst({
      where: {
        id,
        clientId
      },
      include: {
        client: true,
        space: true
      }
    });

    if (!appointment) {
      return res.status(404).json({
        error: "Agendamento não encontrado"
      });
    }

    if (appointment.status === "canceled") {
      return res.status(400).json({
        error: "Este agendamento já está cancelado"
      });
    }

    try {
      

      if (appointment.googleEventId) {
        await deleteGoogleCalendarEvent(
          process.env.DEFAULT_OWNER_USER_ID ,
          appointment
        );
      }
    } catch (googleError) {
      console.error("Erro ao excluir evento no Google Calendar durante cancelamento:", googleError);
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        status: "canceled",
        googleEventId: null,
        googleCalendarId: null,
        googleSyncStatus: "synced",
        googleSyncError: null,
        syncedAt: new Date()
      },
      include: {
        space: true
      }
    });

    res.json({
      message: "Agendamento cancelado com sucesso",
      appointment: updatedAppointment
    });
  } catch (error) {
    console.error("Erro ao cancelar agendamento do cliente:", error);
    res.status(500).json({
      error: "Erro ao cancelar agendamento"
    });
  }
};
import prisma from "../prisma/client.js";
import { deleteGoogleCalendarEvent } from "../services/googleCalendar.service.js";

export const getMyAppointments = async (req, res) => {
  try {
    const patientId = req.patient.patientId;

    const appointments = await prisma.appointment.findMany({
      where: {
        patientId
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
    console.error("Erro ao buscar agendamentos do Paciente:", error);
    res.status(500).json({
      error: "Erro ao buscar agendamentos do Paciente"
    });
  }
};

export const cancelMyAppointment = async (req, res) => {
  try {
    const patientId = req.patient.patientId;
    const { id } = req.params;

    const appointment = await prisma.appointment.findFirst({
      where: {
        id,
        patientId
      },
      include: {
        patient: true,
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
    console.error("Erro ao cancelar agendamento do Paciente:", error);
    res.status(500).json({
      error: "Erro ao cancelar agendamento"
    });
  }
};
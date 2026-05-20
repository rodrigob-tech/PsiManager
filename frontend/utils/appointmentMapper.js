import { STATUS_COLORS } from "../constants/appointmentStatus";


export function mapAppointmentsToEvents(appointments) {
  return appointments.map((appointment) => ({
    id: appointment.id,
    title: `${appointment.client?.name || "Sem nome"}${
      appointment.space?.name ? ` - ${appointment.space.name}` : ""
    } - ${appointment.status}`,
    start: appointment.date,
    color: STATUS_COLORS[appointment.status] || "#2196f3",
    extendedProps: {
      type: "appointment",
      status: appointment.status,
      clientName: appointment.client?.name || "Sem nome",
      clientEmail: appointment.client?.email || "",
      spaceName: appointment.space?.name || "Sem espaço",
      rawAppointment: appointment
    }
  }));
}

export function mapBlockedTimesToEvents(blockedTimes) {
  return blockedTimes.map((blockedTime) => ({
    id: `blocked-${blockedTime.id}`,
    title: "Horário bloqueado",
    start: blockedTime.start,
    end: blockedTime.end,
    color: "#616161",
    extendedProps: {
      type: "blockedTime",
      rawBlockedTime: blockedTime
    }
  }));
}
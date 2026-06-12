import { STATUS_COLORS, STATUS_OPTIONS } from "../../constants/appointmentStatus";

function getStatusLabel(status) {
  return STATUS_OPTIONS.find((option) => option.value === status)?.label || status;
}
export function mapAppointmentsToEvents(appointments) {
  return appointments.map((appointment) => {
    const statusLabel = getStatusLabel(appointment.status);

    return {
      id: appointment.id,
      title: `${appointment.patient?.name || "Sem nome"}${
        appointment.space?.name ? ` - ${appointment.space.name}` : ""
      } - ${statusLabel}`,
      start: appointment.date,
      color: STATUS_COLORS[appointment.status] || "#2196f3",
      extendedProps: {
        type: "appointment",
        status: appointment.status,
        statusLabel,
        patientName: appointment.patient?.name || "Sem nome",
        patientEmail: appointment.patient?.email || "",
        spaceName: appointment.space?.name || "Sem espaço",
        rawAppointment: appointment
      }
    };
  });
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

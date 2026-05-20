 import prisma from "../prisma/client.js";
import {
  APPOINTMENT_DURATION_MINUTES
} from "../constants/availability.js";
import {
  addMinutes,
  buildSlotEnd,
  endOfDay,
  generateDailySlots,
  intervalsOverlap,
  isBusinessDay,
  isInsideBusinessHours,
  isWithinAdvanceWindow,
  isWithinFutureLimit,
  parseLocalDateString,
  startOfDay
} from "../utils/availability.utils.js";

export async function getBlockedTimesForDay(date) {
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  return prisma.blockedTime.findMany({
    where: {
      start: { lt: dayEnd },
      end: { gt: dayStart }
    },
    orderBy: { start: "asc" }
  });
}

export async function getAppointmentsForDay(date, spaceId) {
  const dayStart = addMinutes(startOfDay(date), -APPOINTMENT_DURATION_MINUTES);
  const dayEnd = endOfDay(date);

  return prisma.appointment.findMany({
    where: {
      spaceId,
      date: {
        gte: dayStart,
        lt: dayEnd
      }
    },
    include: {
      client: true,
      space: true
    },
    orderBy: { date: "asc" }
  });
}

export function slotConflictsWithBlockedTimes(slot, blockedTimes) {
  return blockedTimes.some((blocked) =>
    intervalsOverlap(slot.start, slot.end, new Date(blocked.start), new Date(blocked.end))
  );
}

export function slotConflictsWithAppointments(slot, appointments) {
  return appointments.some((appointment) => {
    const appointmentStart = new Date(appointment.date);
    const appointmentEnd = buildSlotEnd(appointmentStart);

    return intervalsOverlap(slot.start, slot.end, appointmentStart, appointmentEnd);
  });
}

export async function getAvailableSlots({ date, spaceId }) {
  const requestedDate = parseLocalDateString(date);
  if (Number.isNaN(requestedDate.getTime())) {
    throw new Error("Data inválida");
  }

  if (!spaceId) {
    throw new Error("spaceId é obrigatório");
  }

  if (!isBusinessDay(requestedDate)) {
    return [];
  }

  const allSlots = generateDailySlots(requestedDate);
  const blockedTimes = await getBlockedTimesForDay(requestedDate);
  const appointments = await getAppointmentsForDay(requestedDate, spaceId);

  const availableSlots = allSlots.filter((slot) => {
    if (!isWithinAdvanceWindow(slot.start)) return false;
    if (!isWithinFutureLimit(slot.start)) return false;
    if (!isInsideBusinessHours(slot.start, slot.end)) return false;
    if (slotConflictsWithBlockedTimes(slot, blockedTimes)) return false;
    if (slotConflictsWithAppointments(slot, appointments)) return false;

    return true;
  });

  return availableSlots.map((slot) => ({
    start: slot.start.toISOString(),
    end: slot.end.toISOString()
  }));
}

export async function validatePublicBookingRules({ date, spaceId }) {
  const startDate = new Date(date);

  if (Number.isNaN(startDate.getTime())) {
    throw new Error("Data inválida");
  }

  if (!spaceId) {
    throw new Error("spaceId é obrigatório");
  }

  if (!isBusinessDay(startDate)) {
    throw new Error("Apenas dias úteis estão disponíveis");
  }

  if (!isWithinAdvanceWindow(startDate)) {
    throw new Error("O agendamento precisa ter pelo menos 2 horas de antecedência");
  }

  if (!isWithinFutureLimit(startDate)) {
    throw new Error("O agendamento só pode ser feito para os próximos 30 dias");
  }

  const endDate = buildSlotEnd(startDate);

  if (!isInsideBusinessHours(startDate, endDate)) {
    throw new Error("O horário está fora do funcionamento permitido");
  }

  const blockedTimes = await getBlockedTimesForDay(startDate);
  if (
    blockedTimes.some((blocked) =>
      intervalsOverlap(startDate, endDate, new Date(blocked.start), new Date(blocked.end))
    )
  ) {
    throw new Error("Este horário está bloqueado");
  }

  const appointments = await getAppointmentsForDay(startDate, spaceId);
  const hasConflict = appointments.some((appointment) => {
    const appointmentStart = new Date(appointment.date);
    const appointmentEnd = buildSlotEnd(appointmentStart);

    return intervalsOverlap(startDate, endDate, appointmentStart, appointmentEnd);
  });

  if (hasConflict) {
    throw new Error("Já existe um agendamento conflitante para este espaço");
  }
}
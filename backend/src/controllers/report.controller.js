import prisma from "../prisma/client.js";

function getClinicId(req) {
  return req.user?.clinicId || null;
}

function parseDate(value) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function getDateFilter(startDate, endDate) {
  const filter = {};

  if (startDate) {
    filter.gte = startDate;
  }

  if (endDate) {
    filter.lte = endDate;
  }

  return Object.keys(filter).length > 0 ? filter : undefined;
}

export const getDashboardReports = async (req, res) => {
  try {
    const clinicId = getClinicId(req);

    if (!clinicId) {
      return res.status(400).json({
        error: "Usuário não está vinculado a uma clínica",
      });
    }

    const startDate = parseDate(req.query.startDate);
    const endDate = parseDate(req.query.endDate);

    const appointmentDateFilter = getDateFilter(startDate, endDate);

    const appointmentWhere = {
      clinicId,
      ...(appointmentDateFilter && {
        date: appointmentDateFilter,
      }),
    };

    const [
      appointments,
      patientsCount,
      activePatientsCount,
      payments,
      psychologists,
    ] = await Promise.all([
      prisma.appointment.findMany({
        where: appointmentWhere,
        include: {
          patient: true,
          psychologist: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          payment: true,
        },
        orderBy: {
          date: "asc",
        },
      }),

      prisma.patient.count({
        where: {
          clinicId,
        },
      }),

      prisma.patient.count({
        where: {
          clinicId,
          status: "ACTIVE",
        },
      }),

      prisma.payment.findMany({
        where: {
          appointment: {
            clinicId,
            ...(appointmentDateFilter && {
              date: appointmentDateFilter,
            }),
          },
        },
        include: {
          appointment: {
            include: {
              patient: true,
              psychologist: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      }),

      prisma.user.findMany({
        where: {
          clinicId,
          role: "PSYCHOLOGIST",
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
        orderBy: {
          name: "asc",
        },
      }),
    ]);

    const totalAppointments = appointments.length;

    const completedAppointments = appointments.filter(
      (appointment) =>
        appointment.status === "done" ||
        appointment.status === "completed" ||
        appointment.status === "DONE"
    ).length;

    const canceledAppointments = appointments.filter(
      (appointment) =>
        appointment.status === "canceled" ||
        appointment.status === "CANCELED"
    ).length;

    const scheduledAppointments = appointments.filter(
      (appointment) =>
        appointment.status === "scheduled" ||
        appointment.status === "SCHEDULED"
    ).length;

    const paidPayments = payments.filter((payment) => payment.status === "PAID");
    const pendingPayments = payments.filter(
      (payment) => payment.status === "PENDING"
    );

    const totalReceived = paidPayments.reduce(
      (sum, payment) => sum + Number(payment.amount || 0),
      0
    );

    const totalPending = pendingPayments.reduce(
      (sum, payment) => sum + Number(payment.amount || 0),
      0
    );

    const revenueByPsychologist = psychologists.map((psychologist) => {
      const psychologistPayments = paidPayments.filter(
        (payment) =>
          payment.appointment?.psychologist?.id === psychologist.id
      );

      const revenue = psychologistPayments.reduce(
        (sum, payment) => sum + Number(payment.amount || 0),
        0
      );

      const appointmentsCount = appointments.filter(
        (appointment) => appointment.psychologistId === psychologist.id
      ).length;

      return {
        psychologistId: psychologist.id,
        psychologistName: psychologist.name,
        appointmentsCount,
        revenue,
      };
    });

    const appointmentsByStatus = {
      scheduled: scheduledAppointments,
      done: completedAppointments,
      canceled: canceledAppointments,
      total: totalAppointments,
    };

    res.json({
      period: {
        startDate: startDate ? startDate.toISOString() : null,
        endDate: endDate ? endDate.toISOString() : null,
      },
      totals: {
        patients: patientsCount,
        activePatients: activePatientsCount,
        appointments: totalAppointments,
        completedAppointments,
        canceledAppointments,
        scheduledAppointments,
        payments: payments.length,
        totalReceived,
        totalPending,
      },
      appointmentsByStatus,
      revenueByPsychologist,
      recentAppointments: appointments.slice(0, 10),
      recentPayments: payments.slice(0, 10),
    });
  } catch (error) {
    console.error("Erro ao gerar relatórios:", error);
    res.status(500).json({
      error: "Erro ao gerar relatórios",
    });
  }
};
import prisma from "../prisma/client.js";

const paymentInclude = {
  appointment: {
    include: {
      patient: true,
      space: true,
      psychologist: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  },
};

const validStatuses = ["PENDING", "PAID", "CANCELED", "REFUNDED"];

const validMethods = [
  "PIX",
  "CASH",
  "CREDIT_CARD",
  "DEBIT_CARD",
  "BANK_TRANSFER",
  "OTHER",
];

function validatePaymentPayload({ appointmentId, amount, status, method }, isUpdate = false) {
  if (!isUpdate && !appointmentId) {
    return "appointmentId é obrigatório";
  }

  if (!isUpdate && (amount === undefined || amount === null || amount === "")) {
    return "amount é obrigatório";
  }

  if (amount !== undefined && amount !== null && amount !== "") {
    const numericAmount = Number(amount);

    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      return "amount deve ser um número maior que zero";
    }
  }

  if (status && !validStatuses.includes(status)) {
    return "Status de pagamento inválido";
  }

  if (method && !validMethods.includes(method)) {
    return "Forma de pagamento inválida";
  }

  return null;
}

export const getPayments = async (req, res) => {
  try {
    const clinicId = req.user?.clinicId;
    const payments = await prisma.payment.findMany({
      where: {
        appointment: {
          clinicId,
        },
      },
      include: paymentInclude,
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(payments);
  } catch (error) {
    console.error("Erro ao buscar pagamentos:", error);
    res.status(500).json({ error: "Erro ao buscar pagamentos" });
  }
};

export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const clinicId = req.user?.clinicId;
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: paymentInclude,
    });

    if (!payment) {
      return res.status(404).json({ error: "Pagamento não encontrado" });
    }

    res.json(payment);
  } catch (error) {
    console.error("Erro ao buscar pagamento:", error);
    res.status(500).json({ error: "Erro ao buscar pagamento" });
  }
};

export const getPaymentByAppointmentId = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { appointmentId },
      include: paymentInclude,
    });

    if (!payment) {
      return res.status(404).json({ error: "Pagamento não encontrado para este agendamento" });
    }

    res.json(payment);
  } catch (error) {
    console.error("Erro ao buscar pagamento do agendamento:", error);
    res.status(500).json({ error: "Erro ao buscar pagamento do agendamento" });
  }
};

export const createPayment = async (req, res) => {
  try {
    const { appointmentId, amount, status, method, paidAt, notes } = req.body;
    const clinicId = req.user?.clinicId;
    const validationError = validatePaymentPayload({
      appointmentId,
      amount,
      status,
      method,
    });

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }


    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        clinicId,
      },
    });
    const existingPayment = await prisma.payment.findUnique({
      where: { appointmentId },
    });

    if (existingPayment) {
      return res.status(409).json({
        error: "Este agendamento já possui pagamento registrado",
      });
    }

    const payment = await prisma.payment.create({
      data: {
        appointmentId,
        amount: Number(amount),
        status: status || "PENDING",
        method: method || null,
        paidAt: paidAt ? new Date(paidAt) : null,
        notes: notes || null,
      },
      include: paymentInclude,
    });

    res.status(201).json(payment);
  } catch (error) {
    console.error("Erro ao criar pagamento:", error);
    res.status(500).json({ error: "Erro ao criar pagamento" });
  }
};

export const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, status, method, paidAt, notes } = req.body;
    const clinicId = req.user?.clinicId;
    const validationError = validatePaymentPayload(
      {
        amount,
        status,
        method,
      },
      true
    );

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const paymentExists = await prisma.payment.findFirst({
      where: {
        id,
        appointment: {
          clinicId,
        },
      },
    });

    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: {
        ...(amount !== undefined && { amount: Number(amount) }),
        ...(status !== undefined && { status }),
        ...(method !== undefined && { method: method || null }),
        ...(paidAt !== undefined && {
          paidAt: paidAt ? new Date(paidAt) : null,
        }),
        ...(notes !== undefined && { notes: notes || null }),
      },
      include: paymentInclude,
    });

    res.json(updatedPayment);
  } catch (error) {
    console.error("Erro ao atualizar pagamento:", error);
    res.status(500).json({ error: "Erro ao atualizar pagamento" });
  }
};

export const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const clinicId = req.user?.clinicId;
    const paymentExists = await prisma.payment.findFirst({
      where: {
        id,
        appointment: {
          clinicId,
        },
      },
    });
    await prisma.payment.delete({
      where: { id },
    });

    res.json({ message: "Pagamento removido com sucesso" });
  } catch (error) {
    console.error("Erro ao remover pagamento:", error);
    res.status(500).json({ error: "Erro ao remover pagamento" });
  }
};
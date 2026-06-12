import PDFDocument from "pdfkit";
import prisma from "../prisma/client.js";
import { createAuditLog } from "../services/auditLog.service.js";
import nodemailer from "nodemailer";
function getClinicId(req) {
  return req.user?.clinicId || null;
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDateTime(value) {
  if (!value) return "Não informado";

  return new Date(value).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function formatDate(value) {
  if (!value) return "Não informado";

  return new Date(value).toLocaleDateString("pt-BR");
}

function translatePaymentStatus(status) {
  const map = {
    PENDING: "Pendente",
    PAID: "Pago",
    CANCELED: "Cancelado",
    REFUNDED: "Reembolsado",
  };

  return map[status] || status || "Não informado";
}

function translatePaymentMethod(method) {
  const map = {
    CASH: "Dinheiro",
    PIX: "Pix",
    CREDIT_CARD: "Cartão de crédito",
    DEBIT_CARD: "Cartão de débito",
    BANK_TRANSFER: "Transferência bancária",
    OTHER: "Outro",
  };

  return map[method] || method || "Não informado";
}
function createMailTransporter() {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    throw new Error("Configuração de e-mail ausente. Verifique EMAIL_USER e EMAIL_PASS.");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });
}

function buildPaymentReceiptPdfBuffer({ payment, appointment, clinic, patient, psychologist, space }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    });

    const buffers = [];

    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    doc.fontSize(22).text("Recibo de Pagamento", {
      align: "center",
    });

    doc.moveDown(0.5);

    doc.fontSize(12).text("PsiManager", {
      align: "center",
    });

    doc.moveDown(2);

    doc.fontSize(14).text("Dados da Clínica", {
      underline: true,
    });

    doc.moveDown(0.5);

    doc.fontSize(11);
    doc.text(`Clínica: ${clinic?.name || "Não informado"}`);
    doc.text(`Descrição: ${clinic?.description || "Não informado"}`);

    doc.moveDown(1.5);

    doc.fontSize(14).text("Dados do Paciente", {
      underline: true,
    });

    doc.moveDown(0.5);

    doc.fontSize(11);
    doc.text(`Paciente: ${patient?.name || "Não informado"}`);
    doc.text(`E-mail: ${patient?.email || "Não informado"}`);
    doc.text(`Telefone: ${patient?.phone || "Não informado"}`);
    doc.text(`CPF: ${patient?.cpf || "Não informado"}`);

    doc.moveDown(1.5);

    doc.fontSize(14).text("Dados do Atendimento", {
      underline: true,
    });

    doc.moveDown(0.5);

    doc.fontSize(11);
    doc.text(`Data do atendimento: ${formatDateTime(appointment?.date)}`);
    doc.text(`Psicólogo: ${psychologist?.name || "Não informado"}`);
    doc.text(`Espaço/Sala: ${space?.name || "Não informado"}`);

    doc.moveDown(1.5);

    doc.fontSize(14).text("Dados do Pagamento", {
      underline: true,
    });

    doc.moveDown(0.5);

    doc.fontSize(11);
    doc.text(`Valor: ${formatCurrency(payment.amount)}`);
    doc.text(`Método: ${translatePaymentMethod(payment.method)}`);
    doc.text(`Status: ${translatePaymentStatus(payment.status)}`);
    doc.text(`Data do pagamento: ${formatDate(payment.paidAt)}`);
    doc.text(`Observações: ${payment.notes || "Não informado"}`);

    doc.moveDown(2);

    doc.fontSize(11).text(
      "Declaramos para os devidos fins que o pagamento acima foi registrado no sistema PsiManager.",
      {
        align: "justify",
      }
    );

    doc.moveDown(4);

    doc.text("________________________________________", {
      align: "center",
    });

    doc.text(clinic?.name || "Clínica", {
      align: "center",
    });

    doc.moveDown(2);

    doc
      .fontSize(9)
      .fillColor("gray")
      .text(`Documento gerado em ${formatDateTime(new Date())}`, {
        align: "center",
      });

    doc.end();
  });
}
function translatePatientStatus(status) {
  const map = {
    ACTIVE: "Ativo",
    INACTIVE: "Inativo",
    ARCHIVED: "Arquivado",
  };

  return map[status] || status || "Não informado";
}

function translateMedicalRecordStatus(status) {
  const map = {
    OPEN: "Aberto",
    CLOSED: "Fechado",
    ARCHIVED: "Arquivado",
  };

  return map[status] || status || "Não informado";
}

function translateAppointmentStatus(status) {
  const map = {
    scheduled: "Agendado",
    confirmed: "Confirmado",
    pending: "Pendente",
    canceled: "Cancelado",
    done: "Concluído",

    SCHEDULED: "Agendado",
    CONFIRMED: "Confirmado",
    PENDING: "Pendente",
    CANCELED: "Cancelado",
    DONE: "Concluído",
  };

  return map[status] || status || "Sem status";
}
export const generatePaymentReceipt = async (req, res) => {
  try {
    const clinicId = getClinicId(req);
    const { paymentId } = req.params;

    if (!clinicId) {
      return res.status(400).json({
        error: "Usuário não está vinculado a uma clínica",
      });
    }

    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        appointment: {
          clinicId,
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
            clinic: true,
            space: true,
          },
        },
      },
    });

    if (!payment) {
      return res.status(404).json({
        error: "Pagamento não encontrado nesta clínica",
      });
    }
    await createAuditLog({
      req,
      action: "PAYMENT_RECEIPT_GENERATED",
      entity: "Payment",
      entityId: payment.id,
      description: "Recibo de pagamento gerado em PDF",
      metadata: {
        paymentId: payment.id,
        amount: payment.amount,
        status: payment.status,
      },
    });
    const appointment = payment.appointment;
    const clinic = appointment.clinic;
    const patient = appointment.patient;
    const psychologist = appointment.psychologist;
    const space = appointment.space;

    const fileName = `recibo-${payment.id}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${fileName}"`
    );

    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    });

    doc.pipe(res);

    doc
      .fontSize(22)
      .text("Recibo de Pagamento", {
        align: "center",
      });

    doc.moveDown(0.5);

    doc
      .fontSize(12)
      .text("PsiManager", {
        align: "center",
      });

    doc.moveDown(2);

    doc
      .fontSize(14)
      .text("Dados da Clínica", {
        underline: true,
      });

    doc.moveDown(0.5);

    doc.fontSize(11);
    doc.text(`Clínica: ${clinic?.name || "Não informado"}`);
    doc.text(`Descrição: ${clinic?.description || "Não informado"}`);

    doc.moveDown(1.5);

    doc
      .fontSize(14)
      .text("Dados do Paciente", {
        underline: true,
      });

    doc.moveDown(0.5);

    doc.fontSize(11);
    doc.text(`Paciente: ${patient?.name || "Não informado"}`);
    doc.text(`E-mail: ${patient?.email || "Não informado"}`);
    doc.text(`Telefone: ${patient?.phone || "Não informado"}`);
    doc.text(`CPF: ${patient?.cpf || "Não informado"}`);

    doc.moveDown(1.5);

    doc
      .fontSize(14)
      .text("Dados do Atendimento", {
        underline: true,
      });

    doc.moveDown(0.5);

    doc.fontSize(11);
    doc.text(`Data do atendimento: ${formatDateTime(appointment?.date)}`);
    doc.text(`Psicólogo: ${psychologist?.name || "Não informado"}`);
    doc.text(`Espaço/Sala: ${space?.name || "Não informado"}`);

    doc.moveDown(1.5);

    doc
      .fontSize(14)
      .text("Dados do Pagamento", {
        underline: true,
      });

    doc.moveDown(0.5);

    doc.fontSize(11);
    doc.text(`Valor: ${formatCurrency(payment.amount)}`);
    doc.text(`Método: ${translatePaymentMethod(payment.method)}`);
    doc.text(`Status: ${translatePaymentStatus(payment.status)}`);
    doc.text(`Data do pagamento: ${formatDate(payment.paidAt)}`);
    doc.text(`Observações: ${payment.notes || "Não informado"}`);

    doc.moveDown(2);

  

    doc.moveDown(4);

    doc.text("________________________________________", {
      align: "center",
    });

    doc.text(clinic?.name || "Clínica", {
      align: "center",
    });

    doc.moveDown(2);

    doc
      .fontSize(9)
      .fillColor("gray")
      .text(`Documento gerado em ${formatDateTime(new Date())}`, {
        align: "center",
      });

    doc.end();
  } catch (error) {
    console.error("Erro ao gerar recibo de pagamento:", error);

    return res.status(500).json({
      error: "Erro ao gerar recibo de pagamento",
    });
  }
};
export const sendPaymentReceiptByEmail = async (req, res) => {
  try {
    const clinicId = getClinicId(req);
    const { paymentId } = req.params;

    if (!clinicId) {
      return res.status(400).json({
        error: "Usuário não está vinculado a uma clínica",
      });
    }

    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        appointment: {
          clinicId,
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
            clinic: true,
            space: true,
          },
        },
      },
    });

    if (!payment) {
      return res.status(404).json({
        error: "Pagamento não encontrado nesta clínica",
      });
    }

    const appointment = payment.appointment;
    const clinic = appointment.clinic;
    const patient = appointment.patient;
    const psychologist = appointment.psychologist;
    const space = appointment.space;

    if (!patient?.email) {
      return res.status(400).json({
        error: "Paciente não possui e-mail cadastrado",
      });
    }

    const pdfBuffer = await buildPaymentReceiptPdfBuffer({
      payment,
      appointment,
      clinic,
      patient,
      psychologist,
      space,
    });

    const transporter = createMailTransporter();

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: patient.email,
      subject: "Recibo de pagamento - PsiManager",
      html: `
        <p>Olá, ${patient.name || "paciente"}.</p>
        <p>Segue em anexo o recibo de pagamento registrado no sistema PsiManager.</p>
        <p>Atenciosamente,<br/>${clinic?.name || "Clínica"}</p>
      `,
      attachments: [
        {
          filename: `recibo-${payment.id}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    await createAuditLog({
      req,
      action: "PAYMENT_RECEIPT_EMAIL_SENT",
      entity: "Payment",
      entityId: payment.id,
      description: "Recibo de pagamento enviado por e-mail",
      metadata: {
        paymentId: payment.id,
        patientEmail: patient.email,
      },
    });

    return res.json({
      message: "Recibo enviado por e-mail com sucesso",
    });
  } catch (error) {
    console.error("Erro ao enviar recibo por e-mail:", error);

    return res.status(500).json({
      error: "Erro ao enviar recibo por e-mail",
    });
  }
};
export const generatePatientFile = async (req, res) => {
  try {
    const clinicId = getClinicId(req);
    const { patientId } = req.params;

    if (!clinicId) {
      return res.status(400).json({
        error: "Usuário não está vinculado a uma clínica",
      });
    }

    const patient = await prisma.patient.findFirst({
      where: {
        id: patientId,
        clinicId,
      },
      include: {
        clinic: true,
        medicalRecord: {
          include: {
            psychologist: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        appointments: {
          orderBy: {
            date: "desc",
          },
          take: 5,
          include: {
            psychologist: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            space: true,
          },
        },
      },
    });

    if (!patient) {
      return res.status(404).json({
        error: "Paciente não encontrado nesta clínica",
      });
    }
    await createAuditLog({
      req,
      action: "PATIENT_FILE_GENERATED",
      entity: "Patient",
      entityId: patient.id,
      description: "Ficha do paciente gerada em PDF",
      metadata: {
        patientName: patient.name,
      },
    });
    const fileName = `ficha-paciente-${patient.id}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${fileName}"`);

    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    });

    doc.pipe(res);

    doc.fontSize(22).text("Ficha do Paciente", {
      align: "center",
    });

    doc.moveDown(0.5);

    doc.fontSize(12).text("PsiManager", {
      align: "center",
    });

    doc.moveDown(2);

    doc.fontSize(14).text("Dados da Clínica", {
      underline: true,
    });

    doc.moveDown(0.5);

    doc.fontSize(11);
    doc.text(`Clínica: ${patient.clinic?.name || "Não informado"}`);
    doc.text(`Descrição: ${patient.clinic?.description || "Não informado"}`);

    doc.moveDown(1.5);

    doc.fontSize(14).text("Dados Pessoais", {
      underline: true,
    });

    doc.moveDown(0.5);

    doc.fontSize(11);
    doc.text(`Nome: ${patient.name || "Não informado"}`);
    doc.text(`E-mail: ${patient.email || "Não informado"}`);
    doc.text(`Telefone: ${patient.phone || "Não informado"}`);
    doc.text(`CPF: ${patient.cpf || "Não informado"}`);
    doc.text(`Data de nascimento: ${formatDate(patient.birthDate)}`);
    doc.text(`Gênero: ${patient.gender || "Não informado"}`);
    doc.text(`Status: ${translatePatientStatus(patient.status)}`);

    doc.moveDown(1.5);

    doc.fontSize(14).text("Endereço", {
      underline: true,
    });

    doc.moveDown(0.5);

    doc.fontSize(11);
    doc.text(`Endereço: ${patient.address || "Não informado"}`);

    doc.moveDown(1.5);

    doc.fontSize(14).text("Contato de Emergência / Responsável", {
      underline: true,
    });

    doc.moveDown(0.5);

    doc.fontSize(11);
    doc.text(`Contato de emergência: ${patient.emergencyName || "Não informado"}`);
    doc.text(`Telefone de emergência: ${patient.emergencyPhone || "Não informado"}`);
    doc.text(`Responsável: ${patient.guardianName || "Não informado"}`);
    doc.text(`Telefone do responsável: ${patient.guardianPhone || "Não informado"}`);

    doc.moveDown(1.5);

    doc.fontSize(14).text("Informações Clínicas", {
      underline: true,
    });

    doc.moveDown(0.5);

   doc.fontSize(11);
doc.text(`Observações do paciente: ${patient.notes || "Não informado"}`);

doc.moveDown(0.7);

doc.fontSize(12).text("Dados principais do prontuário", {
  underline: true,
});

doc.moveDown(0.4);
doc.fontSize(11);

if (patient.medicalRecord) {
  doc.text(
    `Status do prontuário: ${translateMedicalRecordStatus(
      patient.medicalRecord.status
    )}`
  );

  doc.text(
    `Queixa principal: ${
      patient.medicalRecord.mainComplaint || "Não informado"
    }`
  );

  doc.text(
    `Hipótese diagnóstica: ${
      patient.medicalRecord.diagnosisHypothesis || "Não informado"
    }`
  );

  doc.text(
    `Notas clínicas: ${
      patient.medicalRecord.clinicalNotes || "Não informado"
    }`
  );

  doc.text(
    `Psicólogo responsável: ${
      patient.medicalRecord.psychologist?.name || "Não informado"
    }`
  );
} else {
  doc.text("Prontuário: Não cadastrado");
}
    doc.moveDown(1.5);

    doc.fontSize(14).text("Últimos Agendamentos", {
      underline: true,
    });

    doc.moveDown(0.5);

    if (!patient.appointments || patient.appointments.length === 0) {
      doc.fontSize(11).text("Nenhum agendamento encontrado.");
    } else {
      patient.appointments.forEach((appointment, index) => {
        doc.fontSize(11).text(
          `${index + 1}. ${formatDateTime(appointment.date)} - ${appointment.psychologist?.name || "Psicólogo não informado"
          } - ${appointment.space?.name || "Espaço não informado"} - ${translateAppointmentStatus(
            appointment.status
          )}`
        );
      });
    }

    doc.moveDown(2);

    doc.fontSize(11).text(
      "Este documento contém informações cadastrais e clínicas básicas do paciente registradas no sistema PsiManager.",
      {
        align: "justify",
      }
    );

    doc.moveDown(3);

    doc.text("________________________________________", {
      align: "center",
    });

    doc.text(patient.clinic?.name || "Clínica", {
      align: "center",
    });

    doc.moveDown(2);

    doc
      .fontSize(9)
      .fillColor("gray")
      .text(`Documento gerado em ${formatDateTime(new Date())}`, {
        align: "center",
      });

    doc.end();
  } catch (error) {
    console.error("Erro ao gerar ficha do paciente:", error);

    return res.status(500).json({
      error: "Erro ao gerar ficha do paciente",
    });
  }
};

export const generateFinancialReport = async (req, res) => {
  try {
    const clinicId = getClinicId(req);

    if (!clinicId) {
      return res.status(400).json({
        error: "Usuário não está vinculado a uma clínica",
      });
    }

    const { startDate, endDate } = req.query;

    const parsedStartDate = startDate ? new Date(startDate) : null;
    const parsedEndDate = endDate ? new Date(endDate) : null;

    if (parsedStartDate && Number.isNaN(parsedStartDate.getTime())) {
      return res.status(400).json({
        error: "Data inicial inválida",
      });
    }

    if (parsedEndDate && Number.isNaN(parsedEndDate.getTime())) {
      return res.status(400).json({
        error: "Data final inválida",
      });
    }

    const appointmentDateFilter = {};

    if (parsedStartDate) {
      appointmentDateFilter.gte = parsedStartDate;
    }

    if (parsedEndDate) {
      appointmentDateFilter.lte = parsedEndDate;
    }

    const hasDateFilter = Object.keys(appointmentDateFilter).length > 0;

    const clinic = await prisma.clinic.findUnique({
      where: {
        id: clinicId,
      },
    });

    const payments = await prisma.payment.findMany({
      where: {
        appointment: {
          clinicId,
          ...(hasDateFilter && {
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
            space: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const psychologists = await prisma.user.findMany({
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
    });

    const paidPayments = payments.filter((payment) => payment.status === "PAID");
    const pendingPayments = payments.filter(
      (payment) => payment.status === "PENDING"
    );
    const canceledPayments = payments.filter(
      (payment) => payment.status === "CANCELED"
    );
    const refundedPayments = payments.filter(
      (payment) => payment.status === "REFUNDED"
    );

    const totalReceived = paidPayments.reduce(
      (sum, payment) => sum + Number(payment.amount || 0),
      0
    );

    const totalPending = pendingPayments.reduce(
      (sum, payment) => sum + Number(payment.amount || 0),
      0
    );

    const totalCanceled = canceledPayments.reduce(
      (sum, payment) => sum + Number(payment.amount || 0),
      0
    );

    const totalRefunded = refundedPayments.reduce(
      (sum, payment) => sum + Number(payment.amount || 0),
      0
    );

    const revenueByPsychologist = psychologists.map((psychologist) => {
      const psychologistPayments = paidPayments.filter(
        (payment) => payment.appointment?.psychologist?.id === psychologist.id
      );

      const revenue = psychologistPayments.reduce(
        (sum, payment) => sum + Number(payment.amount || 0),
        0
      );

      return {
        psychologistId: psychologist.id,
        psychologistName: psychologist.name,
        paymentsCount: psychologistPayments.length,
        revenue,
      };
    });
    await createAuditLog({
      req,
      action: "FINANCIAL_REPORT_GENERATED",
      entity: "Report",
      description: "Relatório financeiro gerado em PDF",
      metadata: {
        startDate,
        endDate,
      },
    });
    const fileName = `relatorio-financeiro-${clinicId}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${fileName}"`);

    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    });

    doc.pipe(res);

    doc.fontSize(22).text("Relatório Financeiro", {
      align: "center",
    });

    doc.moveDown(0.5);

    doc.fontSize(12).text("PsiManager", {
      align: "center",
    });

    doc.moveDown(2);

    doc.fontSize(14).text("Dados da Clínica", {
      underline: true,
    });

    doc.moveDown(0.5);

    doc.fontSize(11);
    doc.text(`Clínica: ${clinic?.name || "Não informado"}`);
    doc.text(`Descrição: ${clinic?.description || "Não informado"}`);

    doc.moveDown(1.5);

    doc.fontSize(14).text("Período do Relatório", {
      underline: true,
    });

    doc.moveDown(0.5);

    doc.fontSize(11);
    doc.text(
      `Data inicial: ${parsedStartDate ? formatDate(parsedStartDate) : "Não informado"
      }`
    );
    doc.text(
      `Data final: ${parsedEndDate ? formatDate(parsedEndDate) : "Não informado"
      }`
    );

    doc.moveDown(1.5);

    doc.fontSize(14).text("Resumo Financeiro", {
      underline: true,
    });

    doc.moveDown(0.5);

    doc.fontSize(11);
    doc.text(`Total de pagamentos: ${payments.length}`);
    doc.text(`Pagamentos pagos: ${paidPayments.length}`);
    doc.text(`Pagamentos pendentes: ${pendingPayments.length}`);
    doc.text(`Pagamentos cancelados: ${canceledPayments.length}`);
    doc.text(`Pagamentos reembolsados: ${refundedPayments.length}`);
    doc.text(`Total recebido: ${formatCurrency(totalReceived)}`);
    doc.text(`Total pendente: ${formatCurrency(totalPending)}`);
    doc.text(`Total cancelado: ${formatCurrency(totalCanceled)}`);
    doc.text(`Total reembolsado: ${formatCurrency(totalRefunded)}`);

    doc.moveDown(1.5);

    doc.fontSize(14).text("Receita por Psicólogo", {
      underline: true,
    });

    doc.moveDown(0.5);

    if (!revenueByPsychologist.length) {
      doc.fontSize(11).text("Nenhum psicólogo encontrado.");
    } else {
      revenueByPsychologist.forEach((item, index) => {
        doc.fontSize(11).text(
          `${index + 1}. ${item.psychologistName} - ${item.paymentsCount
          } pagamento(s) - ${formatCurrency(item.revenue)}`
        );
      });
    }

    doc.moveDown(1.5);

    doc.fontSize(14).text("Pagamentos Recentes", {
      underline: true,
    });

    doc.moveDown(0.5);

    if (!payments.length) {
      doc.fontSize(11).text("Nenhum pagamento encontrado no período.");
    } else {
      payments.slice(0, 20).forEach((payment, index) => {
        const patientName =
          payment.appointment?.patient?.name || "Paciente não informado";

        const psychologistName =
          payment.appointment?.psychologist?.name ||
          "Psicólogo não informado";

        const appointmentDate = payment.appointment?.date
          ? formatDateTime(payment.appointment.date)
          : "Data não informada";

        doc.fontSize(10).text(
          `${index + 1}. ${patientName} | ${psychologistName} | ${appointmentDate} | ${formatCurrency(
            payment.amount
          )} | ${translatePaymentMethod(payment.method)} | ${translatePaymentStatus(
            payment.status
          )}`
        );
      });
    }

    doc.moveDown(2);

   

    doc.moveDown(3);

    doc.text("________________________________________", {
      align: "center",
    });

    doc.text(clinic?.name || "Clínica", {
      align: "center",
    });

    doc.moveDown(2);

    doc
      .fontSize(9)
      .fillColor("gray")
      .text(`Documento gerado em ${formatDateTime(new Date())}`, {
        align: "center",
      });

    doc.end();
  } catch (error) {
    console.error("Erro ao gerar relatório financeiro:", error);

    return res.status(500).json({
      error: "Erro ao gerar relatório financeiro",
    });
  }
};
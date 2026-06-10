import PDFDocument from "pdfkit";
import prisma from "../prisma/client.js";

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

    doc
      .fontSize(11)
      .text(
        `Declaramos para os devidos fins que o pagamento acima foi registrado no sistema PsiManager.`,
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
  } catch (error) {
    console.error("Erro ao gerar recibo de pagamento:", error);

    return res.status(500).json({
      error: "Erro ao gerar recibo de pagamento",
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
    doc.text(`Status: ${patient.status || "Não informado"}`);

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
    doc.text(`Observações: ${patient.notes || "Não informado"}`);

    if (patient.medicalRecord) {
      doc.moveDown(0.7);
      doc.text(`Status do prontuário: ${patient.medicalRecord.status || "Não informado"}`);
      doc.text(`Queixa principal: ${patient.medicalRecord.mainComplaint || "Não informado"}`);
      doc.text(
        `Hipótese diagnóstica: ${
          patient.medicalRecord.diagnosisHypothesis || "Não informado"
        }`
      );
      doc.text(`Notas clínicas: ${patient.medicalRecord.clinicalNotes || "Não informado"}`);
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
          `${index + 1}. ${formatDateTime(appointment.date)} - ${
            appointment.psychologist?.name || "Psicólogo não informado"
          } - ${appointment.space?.name || "Espaço não informado"} - ${
            appointment.status || "Sem status"
          }`
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
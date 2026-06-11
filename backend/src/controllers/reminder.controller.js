import prisma from "../prisma/client.js";
import { sendEmail } from "../services/email.service.js";
import { createAuditLog } from "../services/auditLog.service.js";

function getClinicId(req) {
  return req.user?.clinicId || null;
}

export const sendPatientReminderEmail = async (req, res) => {
  try {
    const clinicId = getClinicId(req);
    const { patientId } = req.params;
    const { subject, message } = req.body;

    if (!clinicId) {
      return res.status(400).json({
        error: "Usuário não está vinculado a uma clínica",
      });
    }

    if (!subject || !message) {
      return res.status(400).json({
        error: "Assunto e mensagem são obrigatórios",
      });
    }

    const patient = await prisma.patient.findFirst({
      where: {
        id: patientId,
        clinicId,
      },
      include: {
        clinic: true,
      },
    });

    if (!patient) {
      return res.status(404).json({
        error: "Paciente não encontrado nesta clínica",
      });
    }

    if (!patient.email) {
      return res.status(400).json({
        error: "Paciente não possui e-mail cadastrado",
      });
    }

    const senderName = req.user?.name || "Profissional";
    const clinicName = patient.clinic?.name || "Clínica";

    const html = `
      <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.5;">
        <h2 style="margin-bottom: 8px;">${subject}</h2>

        <p>Olá, ${patient.name}.</p>

        <p>${message.replace(/\n/g, "<br />")}</p>

        <br />

        <p>
          Atenciosamente,<br />
          <strong>${senderName}</strong><br />
          ${clinicName}
        </p>

        <hr style="margin-top: 24px; border: none; border-top: 1px solid #e5e7eb;" />

        <p style="font-size: 12px; color: #6b7280;">
          Este lembrete foi enviado pelo sistema PsiManager.
        </p>
      </div>
    `;

    await sendEmail({
      to: patient.email,
      subject,
      text: message,
      html,
    });

    await createAuditLog({
      req,
      action: "PATIENT_REMINDER_EMAIL_SENT",
      entity: "Patient",
      entityId: patient.id,
      description: `Lembrete enviado por e-mail para ${patient.name}`,
      metadata: {
        patientName: patient.name,
        patientEmail: patient.email,
        subject,
      },
    });

    return res.json({
      message: "Lembrete enviado com sucesso",
      patient: {
        id: patient.id,
        name: patient.name,
        email: patient.email,
      },
    });
  } catch (error) {
    console.error("Erro ao enviar lembrete por e-mail:", error);

    return res.status(500).json({
      error: "Erro ao enviar lembrete por e-mail",
    });
  }
};
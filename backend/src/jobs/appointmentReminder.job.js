import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { sendEmail } from "../services/email.service.js";

dotenv.config();

const prisma = new PrismaClient();

async function runReminderJob() {
  try {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    const appointments = await prisma.appointment.findMany({
      where: {
        reminderSent: false,
        date: {
          gte: now,
          lte: oneHourLater
        }
      },
      include: {
        client: true,
        space: true
      }
    });

    for (const appointment of appointments) {
      if (!appointment.client?.email) continue;

      await sendEmail({
        to: appointment.client.email,
        subject: "Lembrete de agendamento",
        text: `Olá, ${appointment.client.name}. Este é um lembrete do seu agendamento em ${new Date(
          appointment.date
        ).toLocaleString("pt-BR")}. Espaço: ${
          appointment.space?.name || "Não informado"
        }.`
      });

      await prisma.appointment.update({
        where: { id: appointment.id },
        data: {
          reminderSent: true
        }
      });
    }

    console.log(`Reminder job executado. Encontrados: ${appointments.length}`);
  } catch (error) {
    console.error("Erro no reminder job:", error);
  } finally {
    await prisma.$disconnect();
  }
}

runReminderJob();
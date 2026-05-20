import { google } from "googleapis";
import prisma from "../prisma/client.js";

const SCOPES = ["https://www.googleapis.com/auth/calendar"];

export function createOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

export function getGoogleAuthUrl(userId) {
  const oauth2Client = createOAuthClient();

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
    state: userId
  });
}

export async function exchangeCodeForTokens(code) {
  const oauth2Client = createOAuthClient();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

export async function saveGoogleTokensToUser(userId, tokens) {
  const expiryDate = tokens.expiry_date
    ? new Date(tokens.expiry_date)
    : null;

  const existingUser = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!existingUser) {
    throw new Error("Usuário não encontrado para salvar tokens Google");
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      googleAccessToken: tokens.access_token ?? existingUser.googleAccessToken,
      googleRefreshToken: tokens.refresh_token ?? existingUser.googleRefreshToken,
      googleTokenExpiry: expiryDate,
      googleConnected: true
    }
  });
}

export async function getOAuthClientForUser(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user || !user.googleConnected) {
    throw new Error("Usuário não conectado ao Google Calendar");
  }

  const oauth2Client = createOAuthClient();

  oauth2Client.setCredentials({
    access_token: user.googleAccessToken || undefined,
    refresh_token: user.googleRefreshToken || undefined,
    expiry_date: user.googleTokenExpiry
      ? new Date(user.googleTokenExpiry).getTime()
      : undefined
  });

  return oauth2Client;
}

export async function createGoogleCalendarEvent(userId, appointment) {
  const auth = await getOAuthClientForUser(userId);
  const calendar = google.calendar({ version: "v3", auth });

  const startDate = new Date(appointment.date);
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

  const event = {
    summary: `Atendimento - ${appointment.client?.name || "Cliente"}`,
    description: [
      `Status: ${appointment.status}`,
      `Cliente: ${appointment.client?.name || "Não informado"}`,
      `Email: ${appointment.client?.email || "Não informado"}`,
      `Telefone: ${appointment.client?.phone || "Não informado"}`,
      `Espaço: ${appointment.space?.name || "Não informado"}`,
      `Appointment ID: ${appointment.id}`
    ].join("\n"),
    start: {
      dateTime: startDate.toISOString(),
      timeZone: "America/Bahia"
    },
    end: {
      dateTime: endDate.toISOString(),
      timeZone: "America/Bahia"
    }
  };

  const response = await calendar.events.insert({
    calendarId: "primary",
    requestBody: event
  });

  return response.data;
}

export async function updateGoogleCalendarEvent(userId, appointment) {
  if (!appointment.googleEventId) {
    throw new Error("Appointment sem googleEventId");
  }

  const auth = await getOAuthClientForUser(userId);
  const calendar = google.calendar({ version: "v3", auth });

  const startDate = new Date(appointment.date);
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

  const event = {
    summary: `Atendimento - ${appointment.client?.name || "Cliente"}`,
    description: [
      `Status: ${appointment.status}`,
      `Cliente: ${appointment.client?.name || "Não informado"}`,
      `Email: ${appointment.client?.email || "Não informado"}`,
      `Telefone: ${appointment.client?.phone || "Não informado"}`,
      `Espaço: ${appointment.space?.name || "Não informado"}`,
      `Appointment ID: ${appointment.id}`
    ].join("\n"),
    start: {
      dateTime: startDate.toISOString(),
      timeZone: "America/Bahia"
    },
    end: {
      dateTime: endDate.toISOString(),
      timeZone: "America/Bahia"
    }
  };

  const response = await calendar.events.update({
    calendarId: appointment.googleCalendarId || "primary",
    eventId: appointment.googleEventId,
    requestBody: event
  });

  return response.data;
}

export async function deleteGoogleCalendarEvent(userId, appointment) {
  if (!appointment.googleEventId) {
    throw new Error("Appointment sem googleEventId");
  }

  const auth = await getOAuthClientForUser(userId);
  const calendar = google.calendar({ version: "v3", auth });

  await calendar.events.delete({
    calendarId: appointment.googleCalendarId || "primary",
    eventId: appointment.googleEventId
  });
}
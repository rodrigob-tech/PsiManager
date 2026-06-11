import prisma from "../prisma/client.js";
import {
  getGoogleAuthUrl,
  exchangeCodeForTokens,
  saveGoogleTokensToUser,
} from "../services/googleCalendar.service.js";
import { createAuditLog } from "../services/auditLog.service.js";

export const startGoogleCalendarAuth = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: "Usuário autenticado não encontrado",
      });
    }

    const authUrl = getGoogleAuthUrl(userId);

    return res.json({
      authUrl,
    });
  } catch (error) {
    console.error("Erro ao iniciar autenticação Google:", error);

    return res.status(500).json({
      error: "Erro ao iniciar autenticação Google",
    });
  }
};

export const googleCalendarCallback = async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code || !state) {
      return res.status(400).json({
        error: "code e state são obrigatórios",
      });
    }

    const tokens = await exchangeCodeForTokens(code);

    await saveGoogleTokensToUser(state, tokens);

    return res.send(`
      <html>
        <body style="font-family: Arial, sans-serif; text-align: center; margin-top: 80px;">
          <h2>Google Agenda conectado com sucesso.</h2>
          <p>Você já pode fechar esta aba e voltar para o PsiManager.</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Erro detalhado no callback do Google:", error);

    return res.status(500).json({
      error: "Erro ao concluir autenticação Google",
      details: error.message,
    });
  }
};

export const getGoogleCalendarStatus = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        googleConnected: true,
        googleCalendarEmail: true,
        googleTokenExpiry: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: "Usuário não encontrado",
      });
    }

    return res.json({
      googleConnected: user.googleConnected,
      googleCalendarEmail: user.googleCalendarEmail,
      googleTokenExpiry: user.googleTokenExpiry,
    });
  } catch (error) {
    console.error("Erro ao consultar status Google:", error);

    return res.status(500).json({
      error: "Erro ao consultar status Google",
    });
  }
};
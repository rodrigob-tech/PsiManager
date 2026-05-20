import {
  getGoogleAuthUrl,
  exchangeCodeForTokens,
  saveGoogleTokensToUser
} from "../services/googleCalendar.service.js";

export const startGoogleCalendarAuth = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        error: "userId é obrigatório"
      });
    }

    const authUrl = getGoogleAuthUrl(userId);
    return res.redirect(authUrl);
  } catch (error) {
    console.error("Erro ao iniciar autenticação Google:", error);
    return res.status(500).json({
      error: "Erro ao iniciar autenticação Google"
    });
  }
};
export const googleCalendarCallback = async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code || !state) {
      return res.status(400).json({
        error: "code e state são obrigatórios"
      });
    }

    console.log("CODE:", code);
    console.log("STATE:", state);

    const tokens = await exchangeCodeForTokens(code);
    console.log("TOKENS:", tokens);

    await saveGoogleTokensToUser(state, tokens);

    return res.send("Google Agenda conectada com sucesso.");
  } catch (error) {
    console.error("Erro detalhado no callback do Google:");
    console.error(error);

    return res.status(500).json({
      error: "Erro ao concluir autenticação Google",
      details: error.message
    });
  }
};
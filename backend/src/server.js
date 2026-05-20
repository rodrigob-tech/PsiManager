import dotenv from "dotenv";
import app from "./app.js";
import bree from "./services/reminder.service.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`Servidor rodando na porta ${PORT}`);

  await bree.start();
  console.log("Bree iniciado com sucesso");
});
import { Router } from "express";
import prisma from "../prisma/client.js";
import authInternal from "../middlewares/authInternal.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
const router = Router();

router.get("/", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar usuários" });
  }
});

router.get("/psychologists", authInternal, authorizeRoles("ADMIN", "PSYCHOLOGIST"), async (req, res) => {
  try {
    const clinicId = req.user?.clinicId;

    if (!clinicId) {
      return res.status(400).json({
        error: "Usuário não está vinculado a uma clínica",
      });
    }

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
        role: true,
        clinicId: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    res.json(psychologists);
  } catch (error) {
    console.error("Erro ao buscar psicólogos:", error);
    res.status(500).json({
      error: "Erro ao buscar psicólogos",
    });
  }
});
router.post("/", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "name, email e password são obrigatórios"
      });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password
      }
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar usuário" });
  }
});

export default router;
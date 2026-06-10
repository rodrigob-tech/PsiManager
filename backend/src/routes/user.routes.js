import { Router } from "express";
import bcrypt from "bcrypt";

import prisma from "../prisma/client.js";
import { requireUserAuth } from "../middlewares/userAuth.middleware.js";

const router = Router();

router.use(requireUserAuth);

function getLoggedUserId(req) {
  return req.user?.userId || req.user?.id || null;
}

async function getLoggedUser(req) {
  const userId = getLoggedUserId(req);

  if (!userId) return null;

  return prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      clinicId: true,
    },
  });
}

router.get("/", async (req, res) => {
  try {
    const loggedUser = await getLoggedUser(req);

    if (!loggedUser) {
      return res.status(401).json({
        error: "Usuário não encontrado",
      });
    }

    if (!loggedUser.clinicId) {
      return res.status(400).json({
        error: "Usuário não está vinculado a uma clínica",
      });
    }

    const users = await prisma.user.findMany({
      where: {
        clinicId: loggedUser.clinicId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        clinicId: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    res.json(users);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);

    res.status(500).json({
      error: "Erro ao buscar usuários",
    });
  }
});

router.get("/psychologists", async (req, res) => {
  try {
    const loggedUser = await getLoggedUser(req);

    if (!loggedUser) {
      return res.status(401).json({
        error: "Usuário não encontrado",
      });
    }

    if (!loggedUser.clinicId) {
      return res.status(400).json({
        error: "Usuário não está vinculado a uma clínica",
      });
    }

    if (loggedUser.role === "PSYCHOLOGIST") {
      return res.json([
        {
          id: loggedUser.id,
          name: loggedUser.name,
          email: loggedUser.email,
          role: loggedUser.role,
          isActive: loggedUser.isActive,
          clinicId: loggedUser.clinicId,
        },
      ]);
    }

    const psychologists = await prisma.user.findMany({
      where: {
        clinicId: loggedUser.clinicId,
        role: "PSYCHOLOGIST",
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
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
    const loggedUser = await getLoggedUser(req);

    if (!loggedUser) {
      return res.status(401).json({
        error: "Usuário não encontrado",
      });
    }

    if (loggedUser.role !== "ADMIN") {
      return res.status(403).json({
        error: "Apenas ADMIN pode criar usuários",
      });
    }

    if (!loggedUser.clinicId) {
      return res.status(400).json({
        error: "Usuário não está vinculado a uma clínica",
      });
    }

    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "name, email e password são obrigatórios",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      return res.status(409).json({
        error: "Já existe um usuário com este email",
      });
    }

    const safeRole = role === "PSYCHOLOGIST" ? "PSYCHOLOGIST" : "ADMIN";

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: safeRole,
        clinicId: loggedUser.clinicId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        clinicId: true,
      },
    });

    res.status(201).json(user);
  } catch (error) {
    console.error("Erro ao criar usuário:", error);

    res.status(500).json({
      error: "Erro ao criar usuário",
    });
  }
});

export default router;
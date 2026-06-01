import bcrypt from "bcrypt";
import prisma from "../prisma/client.js";

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  clinicId: true,
  createdAt: true,
};

export const createClinic = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id;

    if (!name) {
      return res.status(400).json({ error: "Nome da clínica é obrigatório" });
    }

    const existingClinic = await prisma.clinic.findUnique({
      where: { name },
    });

    if (existingClinic) {
      return res.status(409).json({ error: "Já existe uma clínica com este nome" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    if (user.clinicId) {
      return res.status(400).json({
        error: "Este usuário já está vinculado a uma clínica",
      });
    }

    const clinic = await prisma.clinic.create({
      data: {
        name,
        description: description || null,
        users: {
          connect: { id: userId },
        },
      },
      include: {
        users: {
          select: userSelect,
        },
      },
    });

    res.status(201).json(clinic);
  } catch (error) {
    console.error("Erro ao criar clínica:", error);
    res.status(500).json({ error: "Erro ao criar clínica" });
  }
};

export const getMyClinic = async (req, res) => {
  try {
    const { clinicId } = req.user;

    if (!clinicId) {
      return res.status(404).json({ error: "Usuário ainda não possui clínica vinculada" });
    }

    const clinic = await prisma.clinic.findUnique({
      where: { id: clinicId },
      include: {
        users: {
          select: userSelect,
          orderBy: { name: "asc" },
        },
        patients: true,
        spaces: true,
        appointments: true,
        blockedTimes: true,
      },
    });

    if (!clinic) {
      return res.status(404).json({ error: "Clínica não encontrada" });
    }

    res.json(clinic);
  } catch (error) {
    console.error("Erro ao buscar clínica:", error);
    res.status(500).json({ error: "Erro ao buscar clínica" });
  }
};

export const updateMyClinic = async (req, res) => {
  try {
    const { clinicId } = req.user;
    const { name, description } = req.body;

    if (!clinicId) {
      return res.status(404).json({ error: "Usuário ainda não possui clínica vinculada" });
    }

    if (!name) {
      return res.status(400).json({ error: "Nome da clínica é obrigatório" });
    }

    const clinic = await prisma.clinic.update({
      where: { id: clinicId },
      data: {
        name,
        description: description || null,
      },
      include: {
        users: {
          select: userSelect,
          orderBy: { name: "asc" },
        },
      },
    });

    res.json(clinic);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Já existe uma clínica com este nome" });
    }

    console.error("Erro ao atualizar clínica:", error);
    res.status(500).json({ error: "Erro ao atualizar clínica" });
  }
};

export const listClinicUsers = async (req, res) => {
  try {
    const { clinicId } = req.user;

    if (!clinicId) {
      return res.status(404).json({ error: "Usuário ainda não possui clínica vinculada" });
    }

    const users = await prisma.user.findMany({
      where: { clinicId },
      select: userSelect,
      orderBy: { name: "asc" },
    });

    res.json(users);
  } catch (error) {
    console.error("Erro ao listar usuários da clínica:", error);
    res.status(500).json({ error: "Erro ao listar usuários da clínica" });
  }
};

export const createClinicPsychologist = async (req, res) => {
  try {
    const { clinicId } = req.user;
    const { name, email, password } = req.body;

    if (!clinicId) {
      return res.status(404).json({ error: "Admin ainda não possui clínica vinculada" });
    }

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Nome, e-mail e senha são obrigatórios",
      });
    }

    const psychologistsCount = await prisma.user.count({
      where: {
        clinicId,
        role: "PSYCHOLOGIST",
      },
    });

    if (psychologistsCount >= 8) {
      return res.status(400).json({
        error: "A clínica atingiu o limite de 8 psicólogos",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ error: "Já existe um usuário com este e-mail" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const psychologist = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "PSYCHOLOGIST",
        isActive: true,
        clinicId,
      },
      select: userSelect,
    });

    res.status(201).json(psychologist);
  } catch (error) {
    console.error("Erro ao criar psicólogo:", error);
    res.status(500).json({ error: "Erro ao criar psicólogo" });
  }
};

export const updateClinicUserStatus = async (req, res) => {
  try {
    const { clinicId } = req.user;
    const { userId } = req.params;
    const { isActive } = req.body;

    if (!clinicId) {
      return res.status(404).json({ error: "Admin ainda não possui clínica vinculada" });
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).json({ error: "isActive deve ser booleano" });
    }

    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        clinicId,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado nesta clínica" });
    }

    if (user.role === "ADMIN" && user.id === req.user.id && isActive === false) {
      return res.status(400).json({
        error: "Você não pode desativar seu próprio usuário admin",
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: userSelect,
    });

    res.json(updatedUser);
  } catch (error) {
    console.error("Erro ao atualizar usuário da clínica:", error);
    res.status(500).json({ error: "Erro ao atualizar usuário da clínica" });
  }
};
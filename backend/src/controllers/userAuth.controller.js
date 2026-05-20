import bcrypt from "bcrypt";
import prisma from "../prisma/client.js";
import { generateUserToken } from "../services/userToken.service.js";

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "name, email e password são obrigatórios"
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: "Email inválido"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "A senha deve ter pelo menos 6 caracteres"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingUser) {
      return res.status(409).json({
        error: "Já existe um usuário com este email"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword
      }
    });

    const token = generateUserToken(user);

    res.status(201).json({
      message: "Usuário admin criado com sucesso",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Erro ao cadastrar admin:", error);
    res.status(500).json({
      error: "Erro ao cadastrar admin"
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "email e password são obrigatórios"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user) {
      return res.status(401).json({
        error: "Credenciais inválidas"
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({
        error: "Credenciais inválidas"
      });
    }

    const token = generateUserToken(user);

    res.json({
      message: "Login admin realizado com sucesso",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Erro ao autenticar admin:", error);
    res.status(500).json({
      error: "Erro ao autenticar admin"
    });
  }
};

export const getAuthenticatedUserProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        googleConnected: true,
        googleCalendarEmail: true,
        googleTokenExpiry: true
      }
    });

    if (!user) {
      return res.status(404).json({
        error: "Usuário admin não encontrado"
      });
    }

    res.json(user);
  } catch (error) {
    console.error("Erro ao buscar perfil do admin:", error);
    res.status(500).json({
      error: "Erro ao buscar perfil do admin"
    });
  }
};
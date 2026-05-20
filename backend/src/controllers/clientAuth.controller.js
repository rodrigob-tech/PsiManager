import bcrypt from "bcrypt";
import prisma from "../prisma/client.js";
import { generateClientToken } from "../services/clientToken.service.js";

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const registerClient = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        error: "name, email, phone e password são obrigatórios"
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

    const existingClient = await prisma.client.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingClient) {
      return res.status(409).json({
        error: "Já existe uma conta com este email"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const client = await prisma.client.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        phone: phone.trim(),
        password: hashedPassword,
        isActive: true
      }
    });

    const token = generateClientToken(client);

    res.status(201).json({
      message: "Conta criada com sucesso",
      token,
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone
      }
    });
  } catch (error) {
    console.error("Erro ao cadastrar cliente:", error);
    res.status(500).json({
      error: "Erro ao cadastrar cliente"
    });
  }
};

export const loginClient = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "email e password são obrigatórios"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const client = await prisma.client.findUnique({
      where: { email: normalizedEmail }
    });

    if (!client) {
      return res.status(401).json({
        error: "Credenciais inválidas"
      });
    }

    if (!client.isActive) {
      return res.status(403).json({
        error: "Conta desativada"
      });
    }

    const passwordMatches = await bcrypt.compare(password, client.password);

    if (!passwordMatches) {
      return res.status(401).json({
        error: "Credenciais inválidas"
      });
    }

    const token = generateClientToken(client);

    res.json({
      message: "Login realizado com sucesso",
      token,
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone
      }
    });
  } catch (error) {
    console.error("Erro ao autenticar cliente:", error);
    res.status(500).json({
      error: "Erro ao autenticar cliente"
    });
  }
};

export const getAuthenticatedClientProfile = async (req, res) => {
  try {
    const client = await prisma.client.findUnique({
      where: { id: req.client.clientId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!client) {
      return res.status(404).json({
        error: "Cliente não encontrado"
      });
    }

    res.json(client);
  } catch (error) {
    console.error("Erro ao buscar perfil do cliente:", error);
    res.status(500).json({
      error: "Erro ao buscar perfil do cliente"
    });
  }
};
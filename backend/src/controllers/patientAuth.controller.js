import bcrypt from "bcrypt";
import prisma from "../prisma/client.js";
import { generatePatientToken } from "../services/patientToken.service.js";

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const registerPatient = async (req, res) => {
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

    const existingPatient = await prisma.patient.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingPatient) {
      return res.status(409).json({
        error: "Já existe uma conta com este email"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const patient = await prisma.patient.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        phone: phone.trim(),
        password: hashedPassword,
        isActive: true
      }
    });

    const token = generatePatientToken(patient);

    res.status(201).json({
      message: "Conta criada com sucesso",
      token,
      patient: {
        id: patient.id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone
      }
    });
  } catch (error) {
    console.error("Erro ao cadastrar paciente:", error);
    res.status(500).json({
      error: "Erro ao cadastrar paciente"
    });
  }
};

export const loginPatient = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "email e password são obrigatórios"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const patient = await prisma.patient.findUnique({
      where: { email: normalizedEmail }
    });

    if (!patient || !patient.password) {
      return res.status(401).json({
        error: "Credenciais inválidas"
      });
    }

    if (!patient.isActive) {
      return res.status(403).json({
        error: "Conta desativada"
      });
    }

    const passwordMatches = await bcrypt.compare(password, patient.password);

    if (!passwordMatches) {
      return res.status(401).json({
        error: "Credenciais inválidas"
      });
    }

    const token = generatePatientToken(patient);

    res.json({
      message: "Login realizado com sucesso",
      token,
      patient: {
        id: patient.id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone
      }
    });
  } catch (error) {
    console.error("Erro ao autenticar paciente:", error);
    res.status(500).json({
      error: "Erro ao autenticar paciente"
    });
  }
};

export const getAuthenticatedPatientProfile = async (req, res) => {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: req.patient.patientId },
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

    if (!patient) {
      return res.status(404).json({
        error: "Paciente não encontrado"
      });
    }

    res.json(patient);
  } catch (error) {
    console.error("Erro ao buscar perfil do paciente:", error);
    res.status(500).json({
      error: "Erro ao buscar perfil do paciente"
    });
  }
};

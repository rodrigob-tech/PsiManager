import prisma from "../prisma/client.js";

export const getPatients = async (req, res) => {
  try {
    const patients = await prisma.patient.findMany({
      orderBy: { name: "asc" }
    });

    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar pacientes" });
  }
};

export const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await prisma.patient.findUnique({
      where: { id }
    });

    if (!patient) {
      return res.status(404).json({ error: "Paciente não encontrado" });
    }

    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar paciente" });
  }
};

export const createPatient = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({
        error: "Nome, Email e Telefone são obrigatórios"
      });
    }

    const patient = await prisma.patient.create({
      data: {
        name,
        email,
        phone
      }
    });

    res.status(201).json(patient);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar paciente" });
  }
};

export const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone } = req.body;

    const patientExists = await prisma.patient.findUnique({
      where: { id }
    });

    if (!patientExists) {
      return res.status(404).json({ error: "Paciente não encontrado" });
    }

    const updatedPatient = await prisma.patient.update({
      where: { id },
      data: {
        name,
        email,
        phone
      }
    });

    res.json(updatedPatient);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar paciente" });
  }
};

export const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;

    const patientExists = await prisma.patient.findUnique({
      where: { id }
    });

    if (!patientExists) {
      return res.status(404).json({ error: "Paciente não encontrado" });
    }

    await prisma.patient.delete({
      where: { id }
    });

    res.json({ message: "Paciente removido com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao remover paciente" });
  }
};

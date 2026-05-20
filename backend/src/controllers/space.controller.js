import prisma from "../prisma/client.js";

export const getSpaces = async (req, res) => {
  try {
    const spaces = await prisma.space.findMany({
      orderBy: {
        name: "asc"
      }
    });

    res.json(spaces);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar espaços" });
  }
};

export const getSpaceById = async (req, res) => {
  try {
    const { id } = req.params;

    const space = await prisma.space.findUnique({
      where: { id }
    });

    if (!space) {
      return res.status(404).json({ error: "Espaço não encontrado" });
    }

    res.json(space);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar espaço" });
  }
};

export const createSpace = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        error: "name é obrigatório"
      });
    }

    const space = await prisma.space.create({
      data: {
        name,
        description
      }
    });

    res.status(201).json(space);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar espaço" });
  }
};

export const updateSpace = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const spaceExists = await prisma.space.findUnique({
      where: { id }
    });

    if (!spaceExists) {
      return res.status(404).json({ error: "Espaço não encontrado" });
    }

    const updatedSpace = await prisma.space.update({
      where: { id },
      data: {
        name,
        description
      }
    });

    res.json(updatedSpace);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar espaço" });
  }
};

export const deleteSpace = async (req, res) => {
  try {
    const { id } = req.params;

    const spaceExists = await prisma.space.findUnique({
      where: { id }
    });

    if (!spaceExists) {
      return res.status(404).json({ error: "Espaço não encontrado" });
    }

    const linkedAppointments = await prisma.appointment.findFirst({
      where: { spaceId: id }
    });

    if (linkedAppointments) {
      return res.status(400).json({
        error: "Não é possível remover um espaço que já possui agendamentos"
      });
    }

    await prisma.space.delete({
      where: { id }
    });

    res.json({ message: "Espaço removido com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao remover espaço" });
  }
};
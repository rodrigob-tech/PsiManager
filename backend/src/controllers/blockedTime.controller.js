import prisma from "../prisma/client.js";

export const getBlockedTimes = async (req, res) => {
  try {
    const blockedTimes = await prisma.blockedTime.findMany({
      orderBy: {
        start: "asc"
      }
    });

    res.json(blockedTimes);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar bloqueios" });
  }
};

export const getBlockedTimeById = async (req, res) => {
  try {
    const { id } = req.params;

    const blockedTime = await prisma.blockedTime.findUnique({
      where: { id }
    });

    if (!blockedTime) {
      return res.status(404).json({ error: "Bloqueio não encontrado" });
    }

    res.json(blockedTime);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar bloqueio" });
  }
};

export const createBlockedTime = async (req, res) => {
  try {
    const { start, end } = req.body;

    if (!start || !end) {
      return res.status(400).json({
        error: "start e end são obrigatórios"
      });
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (startDate >= endDate) {
      return res.status(400).json({
        error: "start deve ser menor que end"
      });
    }

    const blockedTime = await prisma.blockedTime.create({
      data: {
        start: startDate,
        end: endDate
      }
    });

    res.status(201).json(blockedTime);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar bloqueio" });
  }
};

export const updateBlockedTime = async (req, res) => {
  try {
    const { id } = req.params;
    const { start, end } = req.body;

    const blockedTimeExists = await prisma.blockedTime.findUnique({
      where: { id }
    });

    if (!blockedTimeExists) {
      return res.status(404).json({ error: "Bloqueio não encontrado" });
    }

    const dataToUpdate = {};

    if (start) dataToUpdate.start = new Date(start);
    if (end) dataToUpdate.end = new Date(end);

    if (
      dataToUpdate.start &&
      dataToUpdate.end &&
      dataToUpdate.start >= dataToUpdate.end
    ) {
      return res.status(400).json({
        error: "start deve ser menor que end"
      });
    }

    const updatedBlockedTime = await prisma.blockedTime.update({
      where: { id },
      data: dataToUpdate
    });

    res.json(updatedBlockedTime);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar bloqueio" });
  }
};

export const deleteBlockedTime = async (req, res) => {
  try {
    const { id } = req.params;

    const blockedTimeExists = await prisma.blockedTime.findUnique({
      where: { id }
    });

    if (!blockedTimeExists) {
      return res.status(404).json({ error: "Bloqueio não encontrado" });
    }

    await prisma.blockedTime.delete({
      where: { id }
    });

    res.json({ message: "Bloqueio removido com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao remover bloqueio" });
  }
};
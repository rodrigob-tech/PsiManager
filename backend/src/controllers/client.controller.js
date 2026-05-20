import prisma from "../prisma/client.js";

export const getClients = async (req, res) => {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { name: "asc" }
    });

    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar clientes" });
  }
};

export const getClientById = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await prisma.client.findUnique({
      where: { id }
    });

    if (!client) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    res.json(client);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar cliente" });
  }
};

export const createClient = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({
        error: "Nome, Email e Telefone são obrigatórios"
      });
    }

    const client = await prisma.client.create({
      data: {
        name,
        email,
        phone
      }
    });

    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar cliente" });
  }
};

export const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone } = req.body;

    const clientExists = await prisma.client.findUnique({
      where: { id }
    });

    if (!clientExists) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    const updatedClient = await prisma.client.update({
      where: { id },
      data: {
        name,
        email,
        phone
      }
    });

    res.json(updatedClient);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar cliente" });
  }
};

export const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    const clientExists = await prisma.client.findUnique({
      where: { id }
    });

    if (!clientExists) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    await prisma.client.delete({
      where: { id }
    });

    res.json({ message: "Cliente removido com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao remover cliente" });
  }
};
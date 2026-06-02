import prisma from "../prisma/client.js";

function getClinicId(req) {
  return req.user?.clinicId || null;
}

function normalizeOptionalString(value) {
  if (value === undefined) return undefined;
  if (value === null) return null;

  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed || null;
}

function buildSpaceData(body, { partial = false } = {}) {
  const data = {};

  if (!partial || Object.prototype.hasOwnProperty.call(body, "name")) {
    data.name = typeof body.name === "string" ? body.name.trim() : body.name;
  }

  if (!partial || Object.prototype.hasOwnProperty.call(body, "description")) {
    data.description = normalizeOptionalString(body.description);
  }

  

  return data;
}

function validateSpaceData(data) {
  if (!data.name) {
    return "Nome do espaço é obrigatório";
  }

  if (
    data.capacity !== undefined &&
    data.capacity !== null &&
    (Number.isNaN(data.capacity) || data.capacity < 0)
  ) {
    return "Capacidade deve ser um número válido";
  }

  return null;
}

export const getSpaces = async (req, res) => {
  try {
    const clinicId = getClinicId(req);

    if (!clinicId) {
      return res.status(400).json({
        error: "Usuário não está vinculado a uma clínica",
      });
    }

    const spaces = await prisma.space.findMany({
      where: {
        clinicId,
      },
      orderBy: {
        name: "asc",
      },
    });

    res.json(spaces);
  } catch (error) {
    console.error("Erro ao buscar espaços:", error);
    res.status(500).json({ error: "Erro ao buscar espaços" });
  }
};

export const getSpaceById = async (req, res) => {
  try {
    const clinicId = getClinicId(req);
    const { id } = req.params;

    if (!clinicId) {
      return res.status(400).json({
        error: "Usuário não está vinculado a uma clínica",
      });
    }

    const space = await prisma.space.findFirst({
      where: {
        id,
        clinicId,
      },
    });

    if (!space) {
      return res.status(404).json({
        error: "Espaço não encontrado nesta clínica",
      });
    }

    res.json(space);
  } catch (error) {
    console.error("Erro ao buscar espaço:", error);
    res.status(500).json({ error: "Erro ao buscar espaço" });
  }
};

export const createSpace = async (req, res) => {
  try {
    const clinicId = getClinicId(req);

    if (!clinicId) {
      return res.status(400).json({
        error: "Usuário não está vinculado a uma clínica",
      });
    }

    const data = buildSpaceData(req.body);
    const validationError = validateSpaceData(data);

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const existingSpace = await prisma.space.findFirst({
      where: {
        name: data.name,
        clinicId,
      },
    });

    if (existingSpace) {
      return res.status(409).json({
        error: "Já existe um espaço com este nome nesta clínica",
      });
    }

    const space = await prisma.space.create({
      data: {
        ...data,
        clinicId,
      },
    });

    res.status(201).json(space);
  } catch (error) {
    console.error("Erro ao criar espaço:", error);
    res.status(500).json({ error: "Erro ao criar espaço" });
  }
};

export const updateSpace = async (req, res) => {
  try {
    const clinicId = getClinicId(req);
    const { id } = req.params;

    if (!clinicId) {
      return res.status(400).json({
        error: "Usuário não está vinculado a uma clínica",
      });
    }

    const spaceExists = await prisma.space.findFirst({
      where: {
        id,
        clinicId,
      },
    });

    if (!spaceExists) {
      return res.status(404).json({
        error: "Espaço não encontrado nesta clínica",
      });
    }

    const data = buildSpaceData(req.body, { partial: true });

    const validationError = validateSpaceData({
      ...spaceExists,
      ...data,
    });

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    if (data.name) {
      const existingSpaceWithName = await prisma.space.findFirst({
        where: {
          name: data.name,
          clinicId,
          id: {
            not: id,
          },
        },
      });

      if (existingSpaceWithName) {
        return res.status(409).json({
          error: "Já existe outro espaço com este nome nesta clínica",
        });
      }
    }

    const updatedSpace = await prisma.space.update({
      where: {
        id,
      },
      data,
    });

    res.json(updatedSpace);
  } catch (error) {
    console.error("Erro ao atualizar espaço:", error);
    res.status(500).json({ error: "Erro ao atualizar espaço" });
  }
};

export const deleteSpace = async (req, res) => {
  try {
    const clinicId = getClinicId(req);
    const { id } = req.params;

    if (!clinicId) {
      return res.status(400).json({
        error: "Usuário não está vinculado a uma clínica",
      });
    }

    const spaceExists = await prisma.space.findFirst({
      where: {
        id,
        clinicId,
      },
      include: {
        appointments: true,
        blockedTimes: true,
      },
    });

    if (!spaceExists) {
      return res.status(404).json({
        error: "Espaço não encontrado nesta clínica",
      });
    }

    if (spaceExists.appointments.length > 0 || spaceExists.blockedTimes.length > 0) {
      const archivedSpace = await prisma.space.update({
        where: {
          id,
        },
        data: {
          isActive: false,
        },
      });

      return res.json({
        message:
          "Espaço possui agendamentos/bloqueios e foi desativado em vez de excluído",
        space: archivedSpace,
      });
    }

    await prisma.space.delete({
      where: {
        id,
      },
    });

    res.json({ message: "Espaço removido com sucesso" });
  } catch (error) {
    console.error("Erro ao remover espaço:", error);
    res.status(500).json({ error: "Erro ao remover espaço" });
  }
};
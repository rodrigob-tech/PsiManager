import prisma from "../prisma/client.js";

function getClinicId(req) {
  return req.user?.clinicId || null;
}

function buildBlockedTimeData(body, { partial = false } = {}) {
  const data = {};

  if (!partial || Object.prototype.hasOwnProperty.call(body, "start")) {
    data.start = body.start ? new Date(body.start) : undefined;
  }

  if (!partial || Object.prototype.hasOwnProperty.call(body, "end")) {
    data.end = body.end ? new Date(body.end) : undefined;
  }

  if (!partial || Object.prototype.hasOwnProperty.call(body, "reason")) {
    data.reason =
      typeof body.reason === "string" && body.reason.trim()
        ? body.reason.trim()
        : null;
  }

  if (!partial || Object.prototype.hasOwnProperty.call(body, "spaceId")) {
    data.spaceId = body.spaceId || null;
  }

  return data;
}

function validateBlockedTimeData(data) {
  if (!data.start) {
    return "Data/hora inicial é obrigatória";
  }

  if (!data.end) {
    return "Data/hora final é obrigatória";
  }

  if (Number.isNaN(data.start.getTime())) {
    return "Data/hora inicial inválida";
  }

  if (Number.isNaN(data.end.getTime())) {
    return "Data/hora final inválida";
  }

  if (data.end <= data.start) {
    return "Data/hora final deve ser maior que a inicial";
  }

  return null;
}

export const getBlockedTimes = async (req, res) => {
  try {
    const clinicId = getClinicId(req);

    if (!clinicId) {
      return res.status(400).json({
        error: "Usuário não está vinculado a uma clínica",
      });
    }

    const blockedTimes = await prisma.blockedTime.findMany({
      where: {
        clinicId,
      },
      include: {
        space: true,
      },
      orderBy: {
        start: "asc",
      },
    });

    res.json(blockedTimes);
  } catch (error) {
    console.error("Erro ao buscar bloqueios:", error);
    res.status(500).json({ error: "Erro ao buscar bloqueios" });
  }
};

export const getBlockedTimeById = async (req, res) => {
  try {
    const clinicId = getClinicId(req);
    const { id } = req.params;

    if (!clinicId) {
      return res.status(400).json({
        error: "Usuário não está vinculado a uma clínica",
      });
    }

    const blockedTime = await prisma.blockedTime.findFirst({
      where: {
        id,
        clinicId,
      },
      include: {
        space: true,
      },
    });

    if (!blockedTime) {
      return res.status(404).json({
        error: "Bloqueio não encontrado nesta clínica",
      });
    }

    res.json(blockedTime);
  } catch (error) {
    console.error("Erro ao buscar bloqueio:", error);
    res.status(500).json({ error: "Erro ao buscar bloqueio" });
  }
};

export const createBlockedTime = async (req, res) => {
  try {
    const clinicId = getClinicId(req);

    if (!clinicId) {
      return res.status(400).json({
        error: "Usuário não está vinculado a uma clínica",
      });
    }

    const data = buildBlockedTimeData(req.body);
    const validationError = validateBlockedTimeData(data);

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    if (data.spaceId) {
      const space = await prisma.space.findFirst({
        where: {
          id: data.spaceId,
          clinicId,
        },
      });

      if (!space) {
        return res.status(404).json({
          error: "Espaço não encontrado nesta clínica",
        });
      }
    }

    const blockedTime = await prisma.blockedTime.create({
      data: {
        ...data,
        clinicId,
      },
      include: {
        space: true,
      },
    });

    res.status(201).json(blockedTime);
  } catch (error) {
    console.error("Erro ao criar bloqueio:", error);
    res.status(500).json({ error: "Erro ao criar bloqueio" });
  }
};

export const updateBlockedTime = async (req, res) => {
  try {
    const clinicId = getClinicId(req);
    const { id } = req.params;

    if (!clinicId) {
      return res.status(400).json({
        error: "Usuário não está vinculado a uma clínica",
      });
    }

    const blockedTimeExists = await prisma.blockedTime.findFirst({
      where: {
        id,
        clinicId,
      },
    });

    if (!blockedTimeExists) {
      return res.status(404).json({
        error: "Bloqueio não encontrado nesta clínica",
      });
    }

    const data = buildBlockedTimeData(req.body, { partial: true });

    const mergedData = {
      ...blockedTimeExists,
      ...data,
    };

    const validationError = validateBlockedTimeData(mergedData);

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    if (data.spaceId) {
      const space = await prisma.space.findFirst({
        where: {
          id: data.spaceId,
          clinicId,
        },
      });

      if (!space) {
        return res.status(404).json({
          error: "Espaço não encontrado nesta clínica",
        });
      }
    }

    const updatedBlockedTime = await prisma.blockedTime.update({
      where: {
        id,
      },
      data,
      include: {
        space: true,
      },
    });

    res.json(updatedBlockedTime);
  } catch (error) {
    console.error("Erro ao atualizar bloqueio:", error);
    res.status(500).json({ error: "Erro ao atualizar bloqueio" });
  }
};

export const deleteBlockedTime = async (req, res) => {
  try {
    const clinicId = getClinicId(req);
    const { id } = req.params;

    if (!clinicId) {
      return res.status(400).json({
        error: "Usuário não está vinculado a uma clínica",
      });
    }

    const blockedTimeExists = await prisma.blockedTime.findFirst({
      where: {
        id,
        clinicId,
      },
    });

    if (!blockedTimeExists) {
      return res.status(404).json({
        error: "Bloqueio não encontrado nesta clínica",
      });
    }

    await prisma.blockedTime.delete({
      where: {
        id,
      },
    });

    res.json({ message: "Bloqueio removido com sucesso" });
  } catch (error) {
    console.error("Erro ao remover bloqueio:", error);
    res.status(500).json({ error: "Erro ao remover bloqueio" });
  }
};
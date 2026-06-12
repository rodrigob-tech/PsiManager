import prisma from "../prisma/client.js";

export const getAuditLogs = async (req, res) => {
  try {
    const clinicId = req.user?.clinicId;

    if (!clinicId) {
      return res.status(400).json({
        error: "Usuário não está vinculado a uma clínica",
      });
    }

    const logs = await prisma.auditLog.findMany({
      where: {
        clinicId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    });

    res.json(logs);
  } catch (error) {
    console.error("Erro ao buscar logs de auditoria:", error);

    res.status(500).json({
      error: "Erro ao buscar logs de auditoria",
    });
  }
};
export const clearAuditLogs = async (req, res) => {
  try {
    const clinicId = req.user?.clinicId;

    if (!clinicId) {
      return res.status(400).json({
        error: "Usuário não está vinculado a uma clínica",
      });
    }

    const result = await prisma.auditLog.deleteMany({
      where: {
        clinicId,
      },
    });

    return res.json({
      message: "Logs de auditoria limpos com sucesso",
      deletedCount: result.count,
    });
  } catch (error) {
    console.error("Erro ao limpar logs de auditoria:", error);

    return res.status(500).json({
      error: "Erro ao limpar logs de auditoria",
    });
  }
};
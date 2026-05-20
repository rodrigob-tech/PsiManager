import prisma from "../prisma/client.js";

export const authorizeRoles = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      let role = req.user?.role;

      if (!role && req.user?.userId) {
        const user = await prisma.user.findUnique({
          where: { id: req.user.userId },
          select: { role: true }
        });

        role = user?.role;
      }

      if (!role || !allowedRoles.includes(role)) {
        return res.status(403).json({
          error: "Acesso não autorizado para este perfil"
        });
      }

      req.user.role = role;
      next();
    } catch (error) {
      res.status(500).json({ error: "Erro ao validar perfil do usuário" });
    }
  };
};

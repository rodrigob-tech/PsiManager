import jwt from "jsonwebtoken";
import prisma from "../prisma/client.js";

export default async function authInternal(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: "Token não informado",
      });
    }

    const [bearer, token] = authHeader.split(" ");

    if (bearer !== "Bearer" || !token) {
      return res.status(401).json({
        error: "Formato de token inválido",
      });
    }

    const secret =
      process.env.INTERNAL_JWT_SECRET ||
      process.env.ADMIN_JWT_SECRET ||
      process.env.USER_JWT_SECRET ||
      process.env.JWT_SECRET;

    if (!secret) {
      console.error("Nenhum JWT secret configurado no .env");
      return res.status(500).json({
        error: "Erro de configuração de autenticação",
      });
    }

    const decoded = jwt.verify(token, secret);

    const userId = decoded.id || decoded.userId || decoded.sub;

    if (!userId) {
      return res.status(401).json({
        error: "Token inválido",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        clinicId: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        error: "Usuário não encontrado",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        error: "Usuário inativo",
      });
    }

    req.user = {
      id: user.id,
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      clinicId: user.clinicId,
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Token expirado",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        error: "Token inválido",
      });
    }

    console.error("Erro no authInternal:", error);

    return res.status(500).json({
      error: "Erro ao autenticar usuário",
    });
  }
}
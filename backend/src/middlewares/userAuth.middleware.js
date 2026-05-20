import jwt from "jsonwebtoken";

export const requireUserAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: "Token não enviado"
      });
    }

    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({
        error: "Formato de token inválido"
      });
    }

    const decoded = jwt.verify(token, process.env.USER_JWT_SECRET);

    if (decoded.type !== "user") {
      return res.status(403).json({
        error: "Token inválido para admin"
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      error: "Token inválido ou expirado"
    });
  }
};
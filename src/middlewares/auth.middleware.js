import { verificarToken } from "../utils/jwt.js";

export const authMiddleware = (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      return res.status(401).json({
        message: "Token no proporcionado"
      });
    }

    const token = authorization.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Formato de token inválido"
      });
    }

    const usuario = verificarToken(token);

    req.usuario = usuario;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token inválido o expirado"
    });
  }
};
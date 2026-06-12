import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const generarToken = (usuario) => {
  return jwt.sign(
    {
      id: usuario.id,
      correo: usuario.correo,
      rol: usuario.rol
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN
    }
  );
};

export const verificarToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
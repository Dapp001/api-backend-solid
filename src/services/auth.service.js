import bcrypt from "bcryptjs";
import { UsuarioRepository } from "../repositories/usuario.repository.js";
import { generarToken } from "../utils/jwt.js";

const usuarioRepository = new UsuarioRepository();

export class AuthService {
  async login(correo, password) {
    const usuario = await usuarioRepository.obtenerPorCorreo(correo);

    if (!usuario) {
      throw new Error("Credenciales inválidas");
    }

    const passwordValida = await bcrypt.compare(password, usuario.password);

    if (!passwordValida) {
      throw new Error("Credenciales inválidas");
    }

    const token = generarToken(usuario);

    return {
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        correo: usuario.correo,
        rol: usuario.rol
      }
    };
  }
}
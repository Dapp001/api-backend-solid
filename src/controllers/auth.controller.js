import { AuthService } from "../services/auth.service.js";
import { UsuarioService } from "../services/usuario.service.js";

const authService = new AuthService();
const usuarioService = new UsuarioService();

export const register = async (req, res) => {
  try {
    const usuario = await usuarioService.crearUsuario(req.body);

    return res.status(201).json({
      message: "Usuario registrado correctamente",
      data: usuario
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message
    });
  }
};

export const login = async (req, res) => {
  try {
    const { correo, password } = req.body;

    const result = await authService.login(correo, password);

    return res.json({
      message: "Login correcto",
      data: result
    });
  } catch (error) {
    return res.status(401).json({
      message: error.message
    });
  }
};
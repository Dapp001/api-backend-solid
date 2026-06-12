import { UsuarioService } from "../services/usuario.service.js";

const usuarioService = new UsuarioService();

export const crearUsuario = async (req, res) => {
  try {
    const usuario = await usuarioService.crearUsuario(req.body);

    return res.status(201).json({
      message: "Usuario creado correctamente",
      data: usuario
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message
    });
  }
};

export const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await usuarioService.obtenerUsuarios();

    return res.json({
      message: "Usuarios obtenidos correctamente",
      data: usuarios
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

export const obtenerUsuarioPorId = async (req, res) => {
  try {
    const usuario = await usuarioService.obtenerUsuarioPorId(req.params.id);

    return res.json({
      message: "Usuario obtenido correctamente",
      data: usuario
    });
  } catch (error) {
    return res.status(404).json({
      message: error.message
    });
  }
};

export const actualizarUsuario = async (req, res) => {
  try {
    const usuario = await usuarioService.actualizarUsuario(req.params.id, req.body);

    return res.json({
      message: "Usuario actualizado correctamente",
      data: usuario
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message
    });
  }
};

export const eliminarUsuario = async (req, res) => {
  try {
    await usuarioService.eliminarUsuario(req.params.id);

    return res.json({
      message: "Usuario eliminado correctamente"
    });
  } catch (error) {
    return res.status(404).json({
      message: error.message
    });
  }
};

export const actualizarArchivoUsuario = async (req, res) => {
  try {
    const usuario = await usuarioService.actualizarArchivoUsuario(req.params.id, req.body);

    return res.json({
      message: "Archivo del usuario actualizado correctamente",
      data: usuario
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message
    });
  }
};
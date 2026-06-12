import bcrypt from "bcryptjs";
import { UsuarioRepository } from "../repositories/usuario.repository.js";

const usuarioRepository = new UsuarioRepository();

export class UsuarioService {
  async crearUsuario(data) {
    const { nombre, apellido, correo, password } = data;
  
    if (!nombre || !apellido || !correo || !password) {
      throw new Error("Todos los campos obligatorios deben ser enviados");
    }
  
    const usuarioExiste = await usuarioRepository.obtenerPorCorreo(correo);
  
    if (usuarioExiste) {
      throw new Error("El correo ya está registrado");
    }
  
    const passwordHash = await bcrypt.hash(password, 10);
  
    return usuarioRepository.crear({
      ...data,
      password: passwordHash
    });
  }

  async obtenerUsuarios() {
    return usuarioRepository.obtenerTodos();
  }

  async obtenerUsuarioPorId(id) {
    const usuario = await usuarioRepository.obtenerPorId(id);

    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }

    return usuario;
  }

  async actualizarUsuario(id, data) {
    const { nombre, apellido, correo, rol } = data;
  
    if (!nombre || !apellido || !correo || !rol) {
      throw new Error("Todos los campos obligatorios deben ser enviados");
    }
  
    const usuario = await usuarioRepository.obtenerPorId(id);
  
    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }
  
    return usuarioRepository.actualizar(id, data);
  }

  async eliminarUsuario(id) {
    const eliminado = await usuarioRepository.eliminar(id);

    if (!eliminado) {
      throw new Error("Usuario no encontrado");
    }

    return true;
  }

  async actualizarArchivoUsuario(id, archivoData) {
    const usuario = await usuarioRepository.obtenerPorId(id);
  
    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }
  
    if (!archivoData.archivo_url || !archivoData.archivo_nombre) {
      throw new Error("La URL y el nombre del archivo son obligatorios");
    }
  
    return usuarioRepository.actualizarArchivo(id, archivoData);
  }
}
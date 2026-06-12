import { pool } from "../config/database.js";

export class UsuarioRepository {
  async crear(usuario) {
    const { nombre, apellido, correo, password, rol } = usuario;

    const [result] = await pool.query(
      `INSERT INTO usuarios (nombre, apellido, correo, password, rol)
       VALUES (?, ?, ?, ?, ?)`,
      [nombre, apellido, correo, password, rol || "USER"]
    );

    return {
      id: result.insertId,
      nombre,
      apellido,
      correo,
      rol: rol || "USER"
    };
  }

  async obtenerTodos() {
    const [rows] = await pool.query(
      `SELECT id, nombre, apellido, correo, rol, estado, fecha_creacion, archivo_url, archivo_nombre
       FROM usuarios
       WHERE estado = TRUE`
    );
  
    return rows;
  }

  async obtenerPorId(id) {
    const [rows] = await pool.query(
      `SELECT id, nombre, apellido, correo, rol, estado, fecha_creacion, archivo_url, archivo_nombre
       FROM usuarios
       WHERE id = ? AND estado = TRUE`,
      [id]
    );
  
    return rows[0];
  }

  async obtenerPorCorreo(correo) {
    const [rows] = await pool.query(
      `SELECT *
       FROM usuarios
       WHERE correo = ? AND estado = TRUE`,
      [correo]
    );

    return rows[0];
  }

  async actualizar(id, usuario) {
    const { nombre, apellido, correo, rol } = usuario;

    await pool.query(
      `UPDATE usuarios
       SET nombre = ?, apellido = ?, correo = ?, rol = ?
       WHERE id = ? AND estado = TRUE`,
      [nombre, apellido, correo, rol, id]
    );

    return this.obtenerPorId(id);
  }

  async eliminar(id) {
    const [result] = await pool.query(
      `UPDATE usuarios
       SET estado = FALSE
       WHERE id = ?`,
      [id]
    );

    return result.affectedRows > 0;
  }

  async actualizarArchivo(id, archivoData) {
    const { archivo_url, archivo_nombre } = archivoData;
  
    await pool.query(
      `UPDATE usuarios
       SET archivo_url = ?, archivo_nombre = ?
       WHERE id = ? AND estado = TRUE`,
      [archivo_url, archivo_nombre, id]
    );
  
    return this.obtenerPorId(id);
  }
}
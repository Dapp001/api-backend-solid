import { pool } from "../config/database.js";

export class UsuarioRepository {
  async crear(usuario) {
    const { nombre, apellido, correo, password, rol } = usuario;

    const result = await pool.query(
      `INSERT INTO usuarios (nombre, apellido, correo, password, rol)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, nombre, apellido, correo, rol, estado, fecha_creacion, archivo_url, archivo_nombre`,
      [nombre, apellido, correo, password, rol || "USER"]
    );

    return result.rows[0];
  }

  async obtenerTodos() {
    const result = await pool.query(
      `SELECT id, nombre, apellido, correo, rol, estado, fecha_creacion, archivo_url, archivo_nombre
       FROM usuarios
       WHERE estado = TRUE
       ORDER BY id DESC`
    );

    return result.rows;
  }

  async obtenerPorId(id) {
    const result = await pool.query(
      `SELECT id, nombre, apellido, correo, rol, estado, fecha_creacion, archivo_url, archivo_nombre
       FROM usuarios
       WHERE id = $1 AND estado = TRUE`,
      [id]
    );

    return result.rows[0];
  }

  async obtenerPorCorreo(correo) {
    const result = await pool.query(
      `SELECT *
       FROM usuarios
       WHERE correo = $1 AND estado = TRUE`,
      [correo]
    );

    return result.rows[0];
  }

  async actualizar(id, usuario) {
    const { nombre, apellido, correo, rol } = usuario;

    const result = await pool.query(
      `UPDATE usuarios
       SET nombre = $1,
           apellido = $2,
           correo = $3,
           rol = $4
       WHERE id = $5 AND estado = TRUE
       RETURNING id, nombre, apellido, correo, rol, estado, fecha_creacion, archivo_url, archivo_nombre`,
      [nombre, apellido, correo, rol || "USER", id]
    );

    return result.rows[0];
  }

  async eliminar(id) {
    const result = await pool.query(
      `UPDATE usuarios
       SET estado = FALSE
       WHERE id = $1 AND estado = TRUE
       RETURNING id`,
      [id]
    );

    return result.rowCount > 0;
  }

  async actualizarArchivo(id, archivoData) {
    const { archivo_url, archivo_nombre } = archivoData;

    const result = await pool.query(
      `UPDATE usuarios
       SET archivo_url = $1,
           archivo_nombre = $2
       WHERE id = $3 AND estado = TRUE
       RETURNING id, nombre, apellido, correo, rol, estado, fecha_creacion, archivo_url, archivo_nombre`,
      [archivo_url, archivo_nombre, id]
    );

    return result.rows[0];
  }
}
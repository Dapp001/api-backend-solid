import fs from "fs";
import path from "path";

export const uploadFile = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No se recibió ningún archivo"
      });
    }

    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    return res.status(201).json({
      message: "Archivo subido correctamente",
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: fileUrl
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al subir el archivo",
      error: error.message
    });
  }
};

export const deleteFile = (req, res) => {
  try {
    const { filename } = req.params;

    const filePath = path.join(process.cwd(), "uploads", filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        message: "Archivo no encontrado"
      });
    }

    fs.unlinkSync(filePath);

    return res.json({
      message: "Archivo eliminado correctamente",
      data: {
        filename
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al eliminar el archivo",
      error: error.message
    });
  }
};
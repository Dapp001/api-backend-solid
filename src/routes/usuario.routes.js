import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";

import {
  crearUsuario,
  obtenerUsuarios,
  obtenerUsuarioPorId,
  actualizarUsuario,
  eliminarUsuario,
  actualizarArchivoUsuario
} from "../controllers/usuario.controller.js";

const router = Router();

router.get("/", authMiddleware, obtenerUsuarios);
router.get("/:id", authMiddleware, obtenerUsuarioPorId);
router.patch("/:id/archivo", authMiddleware, actualizarArchivoUsuario);
router.post("/", authMiddleware, crearUsuario);
router.put("/:id", authMiddleware, actualizarUsuario);
router.delete("/:id", authMiddleware, eliminarUsuario);

export default router;
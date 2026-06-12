import { Router } from "express";
import multer from "multer";
import path from "path";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { uploadFile, deleteFile } from "../controllers/upload.controller.js";

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);

    cb(null, `${uniqueName}${extension}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp",
    "application/pdf"
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Tipo de archivo no permitido"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

router.post("/", authMiddleware, upload.single("file"), uploadFile);

router.delete("/:filename", authMiddleware, deleteFile);

export default router;
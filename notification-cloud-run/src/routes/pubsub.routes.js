import express from "express";
import { enviarCorreo } from "../services/email.service.js";

const router = express.Router();

router.post("/push", async (req, res) => {
  try {
    const message = req.body?.message;

    if (!message?.data) {
      return res.status(400).json({ message: "Mensaje inválido" });
    }

    const decoded = JSON.parse(Buffer.from(message.data, "base64").toString());
    const { email, subject, message: text } = decoded;

    await enviarCorreo(email, subject, text);

    console.log(`[Logger] Correo enviado a ${email} - Asunto: ${subject}`);
    return res.status(200).json({ message: "Correo enviado correctamente" });
  } catch (error) {
    console.error("[Logger] Error procesando mensaje Pub/Sub:", error.message);
    return res.status(500).json({ message: error.message });
  }
});

export default router;
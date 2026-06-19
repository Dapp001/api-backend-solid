import { NotificationService } from "../services/notification.service.js";

const notificationService = new NotificationService();

export const sendNotification = async (req, res) => {
  try {
    const { email, subject, message } = req.body;

    if (!email || !subject || !message) {
      return res.status(400).json({
        message: "email, subject y message son requeridos"
      });
    }

    await notificationService.publicarMensaje({ email, subject, message });

    return res.status(200).json({
      message: "Mensaje publicado en Pub/Sub correctamente"
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};
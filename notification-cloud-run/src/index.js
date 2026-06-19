import express from "express";
import pubsubRoutes from "./routes/pubsub.routes.js";

const app = express();
app.use(express.json());
app.use("/pubsub", pubsubRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Notification service corriendo en puerto ${PORT}`));
import { PubSub } from "@google-cloud/pubsub";

const pubsub = new PubSub();
const TOPIC = process.env.PUBSUB_TOPIC || "email-notifications";

export class NotificationService {
  async publicarMensaje(data) {
    const topic = pubsub.topic(TOPIC);
    const buffer = Buffer.from(JSON.stringify(data));
    await topic.publishMessage({ data: buffer });
  }
}
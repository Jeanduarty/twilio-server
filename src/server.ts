import dotenv from "dotenv";
import express from "express";
import twilio from "twilio";
import cors from "cors";
import { z } from "zod";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

app.get("/", (request, response) => {
  console.log('home');
  return response.send("Bem vindo ao meu servidor!");
});

app.post("/sms", async (request, response) => {
  const createUserSchema = z.object({
    phoneNumber: z.string(),
    message: z.string(),
  });

  const { phoneNumber, message } = createUserSchema.parse(request.body);
  //phoneNumber precisa estar no formato por ex: +5533999999999

  try {
    const textMessage = {
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    };

    await client.messages.create(textMessage);
  } catch (error) {
    console.log(error);
  }

  return response.status(201).send();
});

const PORT = process.env.PORT || "3000";

app.listen(PORT, () => {
  console.log(`app running on port ${PORT}`);
});

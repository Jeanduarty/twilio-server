import dotenv from "dotenv";
import express from "express";
import twilio from "twilio";
import cors from "cors";
import { firebaseApp } from "./firebase";
import { getDatabase, onValue, ref, update } from "firebase/database";

type sendMessageProps = {
  body: string;
  to: string;
  from: string;
}

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

  // CONECTAR O TWILIO!
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const database = getDatabase(firebaseApp()); //<== FUNÇÃO PARA INICAR O FIREBASE CONFIGURADO!

async function sendMessage(textMessage: sendMessageProps, key: any) {
  await client.messages.create(textMessage).then(() => {
    update(ref(database, `dispositivos/${key}`), {
      isNotified: true,
    }).then(() => console.log("Enviado com sucesso!"));
  });
}

onValue(ref(database, `dispositivos`), async (snapshot) => {
  const currentHour = new Date().getHours();

  if (snapshot.exists()) {
    await snapshot.forEach((item) => {
      // ESSE IF É PARA RESETAR A NOTIFICAÇÃO
      if (item.val()?.ultimoStatus === "desligado" && item.val()?.isNotified) {
        update(ref(database, `dispositivos/${item.key}`), {
          isNotified: false,
        }).then(() => console.log("change flag to false sucess!"));
      }

      // ESSE IF É A LOGICA PARA ENVIAR A NOTIFICAÇÃO CASO O AR CONDICIONADO ESTEJA FORA DO INTERVALO!
      if (
        (currentHour < item.val()?.interval?.start ||
          currentHour >= item.val()?.interval?.end) &&
        item.val()?.ultimoStatus === "ligado" &&
        !item.val()?.isNotified
      ) {
        const textMessage = {
          body: `O AR CONDICIONADO "${item.key}" ESTÁ LIGADO FORA DO INTERVALO! FAVOR, DESLIGUE-O`,
          from: process.env.TWILIO_PHONE_NUMBER as string,
          to: item.val()?.phone as string,
        };

        // É AQUI QUE ENVIA A MENSAGEM PARA O USUÁRIO
        sendMessage(textMessage, item.key);
      }
    });
  }
});

app.get("/", (request, response) => {
  console.log("home");
  return response.send("Bem vindo ao meu servidor!");
});

const PORT = process.env.PORT || "3000";

app.listen(PORT, () => {
  console.log(`app running on port ${PORT}`);
});

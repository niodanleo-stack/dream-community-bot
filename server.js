const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("🌙 Dream Community Bot est en ligne !");
});

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  res.sendStatus(403);
});

app.post("/webhook", async (req, res) => {
  res.sendStatus(200);

  try {
    const message =
      req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (!message || message.type !== "text") return;

    const texte = message.text?.body || "";
    const destinataire = message.from;

    if (!/dream\s*community/i.test(texte)) return;

    const reponse =
      "🌙✨ DREAM COMMUNITY ✨🌙\n\n" +
      "Bienvenue dans Dream Community ! 💙\n" +
      "Une communauté pour discuter, faire des rencontres, " +
      "partager ses passions et participer à des événements !\n\n" +
      "🔨 Saison 3 : en construction !";

    await axios.post(
      `https://graph.facebook.com/${process.env.GRAPH_API_VERSION}/${process.env.PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: destinataire,
        type: "text",
        text: { body: reponse }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );
  } catch (erreur) {
    console.error(erreur.response?.data || erreur.message);
  }
});

app.listen(PORT, () => {
  console.log(`Bot lancé sur le port ${PORT}`);
});

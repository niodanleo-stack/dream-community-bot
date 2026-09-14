const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// ─────────────────────────────
// PAGE D'ACCUEIL
// ─────────────────────────────

app.get("/", (req, res) => {
  res.send("🌙 Dream Community Bot est en ligne !");
});

// ─────────────────────────────
// VÉRIFICATION DU WEBHOOK META
// ─────────────────────────────

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (
    mode === "subscribe" &&
    token === process.env.VERIFY_TOKEN
  ) {
    console.log("✅ Webhook Meta vérifié");
    return res.status(200).send(challenge);
  }

  console.log("❌ Vérification du webhook refusée");
  return res.sendStatus(403);
});

// ─────────────────────────────
// RÉCEPTION DES MESSAGES
// ─────────────────────────────

app.post("/webhook", async (req, res) => {
  // Répondre immédiatement à Meta
  res.sendStatus(200);

  try {
    console.log("📩 Webhook reçu :", JSON.stringify(req.body, null, 2));

    const value =
      req.body?.entry?.[0]?.changes?.[0]?.value;

    const message = value?.messages?.[0];

    if (!message) {
      console.log("ℹ️ Aucun message trouvé dans le webhook.");
      return;
    }

    if (message.type !== "text") {
      console.log("ℹ️ Message ignoré : type =", message.type);
      return;
    }

    const texte = message.text?.body || "";
    const expediteur = message.from;

    console.log("👤 Expéditeur :", expediteur);
    console.log("💬 Message :", texte);

    // ─────────────────────────────
    // DÉTECTION DE LA MENTION
    // ─────────────────────────────

    const mentions = message.text?.mentions || [];

    const botMentionne =
      mentions.length > 0 ||
      /@bot\b/i.test(texte);

    // ─────────────────────────────
    // DÉCLENCHEUR
    // ─────────────────────────────

    const demandeDreamCommunity =
      /dream\s*community/i.test(texte);

    if (!botMentionne && !demandeDreamCommunity) {
      console.log("ℹ️ Aucun déclencheur détecté.");
      return;
    }

    // ─────────────────────────────
    // RÉPONSE DU BOT
    // ─────────────────────────────

    const reponse =
      "🌙✨ DREAM COMMUNITY ✨🌙\n\n" +
      "Bienvenue dans Dream Community ! 💙\n\n" +
      "Une communauté pour discuter, " +
      "faire des rencontres, partager ses passions " +
      "et participer à des événements ! 🎉\n\n" +
      "🔨 Saison 3 : en construction !";

    // ─────────────────────────────
    // ENVOI DE LA RÉPONSE
    // ─────────────────────────────

    await axios.post(
      `https://graph.facebook.com/${process.env.GRAPH_API_VERSION}/${process.env.PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: expediteur,
        type: "text",
        text: {
          body: reponse
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("✅ Réponse envoyée !");
  } catch (erreur) {
    console.error(
      "❌ ERREUR :",
      erreur.response?.data || erreur.message
    );
  }
});

// ─────────────────────────────
// DÉMARRAGE
// ─────────────────────────────

app.listen(PORT, () => {
  console.log(`🤖 Bot lancé sur le port ${PORT}`);
});

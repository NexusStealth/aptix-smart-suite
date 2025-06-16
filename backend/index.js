const express = require('express');
const Stripe = require('stripe');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Inicialização do Firebase Admin
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});
const db = admin.firestore();

// Middleware para lidar com JSON, exceto no webhook
app.use((req, res, next) => {
  if (req.originalUrl === "/webhook/stripe") {
    next(); // Passa direto pro raw abaixo
  } else {
    express.json()(req, res, next);
  }
});

// Rota de Webhook do Stripe
app.post('/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("⚠️ Erro no webhook:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const customerEmail = session.customer_email;
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1 });
    const priceId = lineItems.data[0]?.price?.id;

    try {
      const usersRef = db.collection('users').where('email', '==', customerEmail);
      const snap = await usersRef.get();

      if (!snap.empty) {
        const userDoc = snap.docs[0];
        let plano;

        if (session.mode === 'subscription' || priceId === "price_1RaTtDAgU97RTqe1bO4k93va") {
          plano = 'monthly'; // Corrigi "miunthly"
        } else if (priceId === "price_1RaTteAgU97RTqe1hh5t7WKn") {
          plano = 'yearly';
        }

        await userDoc.ref.update({
          plano,
          assinaturaAtiva: true,
          atualizadoEm: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log(`✅ Assinatura ativada para ${customerEmail}`);
      } else {
        console.log("⚠️ Usuário não encontrado no Firebase");
      }
    } catch (e) {
      console.error("❌ Erro ao atualizar Firebase:", e);
    }
  }

  res.status(200).json({ received: true });
});

// Rota para criação de sessão de checkout
app.post("/create-checkout-session", async (req, res) => {
  const { plan, email } = req.body;

  const priceId = {
    pro_mensal: "price_1RaTtDAgU97RTqe1bO4k93va",
    pro_anual: "price_1RaTteAgU97RTqe1hh5t7WKn"
  }[plan];

  if (!priceId) {
    return res.status(400).json({ error: "Plano inválido" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: "http://localhost:3000/sucesso",
      cancel_url: "http://localhost:3000/cancelado",
      customer_email: email,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Erro ao criar sessão:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Rota básica de teste
app.get("/", (req, res) => {
  res.send("Servidor Aptix ON");
});

// 🔥 Corrigido: Porta 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🔥 Backend online na porta ${PORT}`));

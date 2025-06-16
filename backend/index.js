import express from 'express';
import Stripe from 'stripe';
import bodyParser from 'body-parser';
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Firebase Admin init
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});
const db = admin.firestore();

// Middleware (exceto para Stripe webhook)
app.use((req, res, next) => {
  if (req.originalUrl === "/webhook/stripe") {
    next(); // usar raw
  } else {
    express.json()(req, res, next);
  }
});

// Webhook Stripe
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
    const priceId = session.amount_total ? session.amount_total : session.display_items?.[0]?.price?.id;

    try {
      const usersRef = db.collection('users').where('email', '==', customerEmail);
      const snap = await usersRef.get();

      if (!snap.empty) {
        const userDoc = snap.docs[0];
        let plano;

        if (session.mode === 'subscription' || priceId === "price_1RaTtDAgU97RTqe1bO4k93va") {
          plano = 'pro_mensal';
        } else if (priceId === "price_1RaTteAgU97RTqe1hh5t7WKn") {
          plano = 'pro_anual';
        }

        await userDoc.ref.update({
          plano,
          assinaturaAtiva: true,
          atualizadoEm: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log(`✅ Assinatura ativa para ${customerEmail}`);
      } else {
        console.log("⚠️ Usuário não encontrado");
      }
    } catch (e) {
      console.error("❌ Erro ao atualizar Firebase:", e);
    }
  }

  res.status(200).json({ received: true });
});

app.get("/", (req, res) => {
  res.send("Servidor Aptix ON");
});

app.listen(3000, () => console.log("🔥 Backend online em http://localhost:3000"));

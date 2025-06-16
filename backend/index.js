const express from 'express';
const Stripe from 'stripe';
const bodyParser from 'body-parser';
const admin from 'firebase-admin';
const dotenv from 'dotenv';

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
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1 });
const priceId = lineItems.data[0]?.price?.id;
    
    try {
      const usersRef = db.collection('users').where('email', '==', customerEmail);
      const snap = await usersRef.get();

      if (!snap.empty) {
        const userDoc = snap.docs[0];
        let plano;

        if (session.mode === 'subscription' || priceId === "price_1RaTtDAgU97RTqe1bO4k93va") {
          plano = 'miunthly';
        } else if (priceId === "price_1RaTteAgU97RTqe1hh5t7WKn") {
          plano = 'yearly';
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

// ✅ NOVA ROTA DE CHECKOUT ADICIONADA AQUI:
app.post("/create-checkout-session", async (req, res) => {
  const { plan, email } = req.body;

  const priceId = {
    pro_mensal: "price_1RaTtDAgU97RTqe1bO4k93va",
    pro_anual: "price_1RaTteAgU97RTqe1hh5t7WKn"
  }[plan];

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: "http://localhost:3000/sucesso",  // Substituir depois pelo domínio real
      cancel_url: "http://localhost:3000/cancelado", // Substituir depois pelo domínio real
      customer_email: email,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Erro ao criar sessão:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get("/", (req, res) => {
  res.send("Servidor Aptix ON");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🔥 Backend online na porta ${PORT}`));

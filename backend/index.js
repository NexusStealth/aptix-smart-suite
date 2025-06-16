
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const stripe = require('stripe');
const admin = require('firebase-admin');

// Configurações
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Configurar Stripe
const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);

// Configurar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
});

const db = admin.firestore();

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173'
}));

// Middleware especial para webhooks do Stripe (raw body)
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

// Middleware para outros endpoints (JSON)
app.use(express.json());

// Rotas

// Criar sessão de checkout
app.post('/api/stripe/create-checkout', async (req, res) => {
  try {
    const { planType, userId } = req.body;

    if (!planType || !userId) {
      return res.status(400).json({ error: 'planType e userId são obrigatórios' });
    }

    // Mapear tipo de plano para Price ID
    const priceIds = {
      monthly: process.env.MENSAL_PRICE_ID,
      yearly: process.env.ANUAL_PRICE_ID
    };

    const priceId = priceIds[planType];
    if (!priceId) {
      return res.status(400).json({ error: 'Tipo de plano inválido' });
    }

    // Buscar dados do usuário no Firebase
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const userData = userDoc.data();

    // Criar sessão do Stripe Checkout
    const session = await stripeClient.checkout.sessions.create({
      customer_email: userData.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing`,
      metadata: {
        userId: userId,
        planType: planType,
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Erro ao criar checkout:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Portal do cliente
app.post('/api/stripe/create-portal', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId é obrigatório' });
    }

    // Buscar dados do usuário no Firebase
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const userData = userDoc.data();

    // Buscar customer do Stripe
    const customers = await stripeClient.customers.list({
      email: userData.email,
      limit: 1,
    });

    if (customers.data.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado no Stripe' });
    }

    const customer = customers.data[0];

    // Criar sessão do portal
    const portalSession = await stripeClient.billingPortal.sessions.create({
      customer: customer.id,
      return_url: `${process.env.FRONTEND_URL}/profile`,
    });

    res.json({ url: portalSession.url });
  } catch (error) {
    console.error('Erro ao criar portal:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Webhook do Stripe
app.post('/api/stripe/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verificar assinatura do webhook
    event = stripeClient.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Erro de verificação do webhook:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Processar eventos
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      
      default:
        console.log(`Evento não tratado: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    res.status(500).json({ error: 'Erro ao processar webhook' });
  }
});

// Funções auxiliares para webhooks

async function handleCheckoutCompleted(session) {
  console.log('Checkout completed:', session.id);
  
  const userId = session.metadata.userId;
  const planType = session.metadata.planType;
  
  if (!userId || !planType) {
    console.error('Metadados faltando na sessão');
    return;
  }

  // Atualizar usuário no Firebase
  await db.collection('users').doc(userId).update({
    plan: planType,
    stripeCustomerId: session.customer,
    subscriptionId: session.subscription,
    planExpiry: admin.firestore.Timestamp.fromDate(
      new Date(Date.now() + (planType === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000)
    ),
    updatedAt: admin.firestore.Timestamp.now(),
  });

  console.log(`Usuário ${userId} atualizado para plano ${planType}`);
}

async function handlePaymentSucceeded(invoice) {
  console.log('Payment succeeded:', invoice.id);
  
  if (invoice.subscription) {
    // Buscar subscription no Stripe
    const subscription = await stripeClient.subscriptions.retrieve(invoice.subscription);
    
    // Buscar usuário no Firebase pelo Stripe Customer ID
    const usersSnapshot = await db.collection('users')
      .where('stripeCustomerId', '==', subscription.customer)
      .limit(1)
      .get();
    
    if (!usersSnapshot.empty) {
      const userDoc = usersSnapshot.docs[0];
      const planType = subscription.items.data[0].price.id === process.env.ANUAL_PRICE_ID ? 'yearly' : 'monthly';
      
      // Atualizar validade da assinatura
      await userDoc.ref.update({
        planExpiry: admin.firestore.Timestamp.fromDate(
          new Date(subscription.current_period_end * 1000)
        ),
        updatedAt: admin.firestore.Timestamp.now(),
      });
      
      console.log(`Assinatura renovada para usuário ${userDoc.id}`);
    }
  }
}

async function handleSubscriptionDeleted(subscription) {
  console.log('Subscription deleted:', subscription.id);
  
  // Buscar usuário no Firebase pelo Stripe Customer ID
  const usersSnapshot = await db.collection('users')
    .where('stripeCustomerId', '==', subscription.customer)
    .limit(1)
    .get();
  
  if (!usersSnapshot.empty) {
    const userDoc = usersSnapshot.docs[0];
    
    // Retornar para plano gratuito
    await userDoc.ref.update({
      plan: 'free',
      subscriptionId: null,
      planExpiry: null,
      updatedAt: admin.firestore.Timestamp.now(),
    });
    
    console.log(`Usuário ${userDoc.id} retornado ao plano gratuito`);
  }
}

async function handleSubscriptionUpdated(subscription) {
  console.log('Subscription updated:', subscription.id);
  
  // Buscar usuário no Firebase pelo Stripe Customer ID
  const usersSnapshot = await db.collection('users')
    .where('stripeCustomerId', '==', subscription.customer)
    .limit(1)
    .get();
  
  if (!usersSnapshot.empty) {
    const userDoc = usersSnapshot.docs[0];
    const planType = subscription.items.data[0].price.id === process.env.ANUAL_PRICE_ID ? 'yearly' : 'monthly';
    
    // Atualizar dados da assinatura
    await userDoc.ref.update({
      plan: planType,
      planExpiry: admin.firestore.Timestamp.fromDate(
        new Date(subscription.current_period_end * 1000)
      ),
      updatedAt: admin.firestore.Timestamp.now(),
    });
    
    console.log(`Assinatura atualizada para usuário ${userDoc.id}`);
  }
}

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Aptix Backend está funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`🚀 Servidor Aptix rodando na porta ${port}`);
  console.log(`📋 Variáveis de ambiente necessárias:`);
  console.log(`   - STRIPE_SECRET_KEY: ${process.env.STRIPE_SECRET_KEY ? '✅ Configurada' : '❌ Faltando'}`);
  console.log(`   - STRIPE_WEBHOOK_SECRET: ${process.env.STRIPE_WEBHOOK_SECRET ? '✅ Configurada' : '❌ Faltando'}`);
  console.log(`   - MENSAL_PRICE_ID: ${process.env.MENSAL_PRICE_ID ? '✅ Configurada' : '❌ Faltando'}`);
  console.log(`   - ANUAL_PRICE_ID: ${process.env.ANUAL_PRICE_ID ? '✅ Configurada' : '❌ Faltando'}`);
});


// TODO: Configurar backend do Stripe
// Este arquivo contém funções para integrar com o backend do Stripe

const BACKEND_URL = 'http://localhost:3001'; // Ajuste para sua URL do backend

class StripeService {
  async createCheckoutSession(planType) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/stripe/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planType, // 'monthly' ou 'yearly'
          userId: localStorage.getItem('userId'), // ou obter do contexto
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar sessão de checkout');
      }

      const data = await response.json();
      
      // Redirecionar para o Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
      
      return data;
    } catch (error) {
      console.error('Erro no checkout:', error);
      throw error;
    }
  }

  async createPortalSession() {
    try {
      const response = await fetch(`${BACKEND_URL}/api/stripe/create-portal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: localStorage.getItem('userId'),
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar sessão do portal');
      }

      const data = await response.json();
      
      // Redirecionar para o Portal do Cliente
      if (data.url) {
        window.location.href = data.url;
      }
      
      return data;
    } catch (error) {
      console.error('Erro no portal:', error);
      throw error;
    }
  }
}

export default new StripeService();

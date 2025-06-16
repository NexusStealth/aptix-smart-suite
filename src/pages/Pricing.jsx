
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { Check, Crown, Zap, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import stripeService from '../services/stripeService';
import { useToast } from '../hooks/use-toast';

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);
  const [loading, setLoading] = useState({ monthly: false, yearly: false });
  const { userPlan } = useAuth();
  const { toast } = useToast();

  const handleSubscribe = async (planType) => {
    setLoading(prev => ({ ...prev, [planType]: true }));
    
    try {
      await stripeService.createCheckoutSession(planType);
    } catch (error) {
      toast({
        title: "Erro ao processar pagamento",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, [planType]: false }));
    }
  };

  const plans = [
    {
      name: 'Gratuito',
      description: 'Perfeito para começar',
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: [
        '5 gerações de IA por dia',
        'Acesso a todas as ferramentas',
        'Interface moderna',
        'Suporte por email'
      ],
      limitations: [
        'Sem histórico salvo',
        'Sem exportação PDF',
        'Limite diário de uso'
      ],
      icon: Star,
      color: 'border-gray-200',
      current: userPlan?.plan === 'free'
    },
    {
      name: 'Mensal',
      description: 'Ideal para uso regular',
      monthlyPrice: 29.90,
      yearlyPrice: 299.90,
      features: [
        'Uso ilimitado de IA',
        'Histórico completo salvo',
        'Exportação em PDF',
        'Suporte prioritário',
        'Novos recursos primeiro',
        'Sem anúncios'
      ],
      icon: Zap,
      color: 'border-primary',
      popular: true,
      current: userPlan?.plan === 'monthly'
    },
    {
      name: 'Anual',
      description: 'Melhor valor a longo prazo',
      monthlyPrice: 19.90,
      yearlyPrice: 239.90,
      savings: '33% de desconto',
      features: [
        'Tudo do plano mensal',
        'Economia de 33%',
        'Acesso beta antecipado',
        'Consultoria personalizada',
        'API premium (em breve)',
        'Prioridade máxima no suporte'
      ],
      icon: Crown,
      color: 'border-gradient-to-r from-purple-500 to-pink-500',
      premium: true,
      current: userPlan?.plan === 'yearly'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Escolha seu plano</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Desbloqueie todo o potencial da IA com nossos planos flexíveis
        </p>
        
        {/* Billing Toggle */}
        <div className="flex items-center justify-center space-x-3">
          <span className={`text-sm ${!isYearly ? 'font-medium' : 'text-muted-foreground'}`}>
            Mensal
          </span>
          <Switch
            checked={isYearly}
            onCheckedChange={setIsYearly}
          />
          <span className={`text-sm ${isYearly ? 'font-medium' : 'text-muted-foreground'}`}>
            Anual
          </span>
          {isYearly && (
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              Economize 33%
            </Badge>
          )}
        </div>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
          const billingPeriod = isYearly ? 'ano' : 'mês';
          
          return (
            <Card 
              key={plan.name} 
              className={`relative ${plan.color} ${plan.popular ? 'ring-2 ring-primary shadow-lg scale-105' : ''}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                  Mais Popular
                </Badge>
              )}
              
              {plan.premium && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500">
                  Melhor Valor
                </Badge>
              )}

              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    plan.name === 'Gratuito' ? 'bg-gray-100' :
                    plan.name === 'Mensal' ? 'bg-primary/10' :
                    'bg-gradient-to-r from-purple-500 to-pink-500'
                  }`}>
                    <Icon className={`h-6 w-6 ${
                      plan.name === 'Gratuito' ? 'text-gray-600' :
                      plan.name === 'Mensal' ? 'text-primary' :
                      'text-white'
                    }`} />
                  </div>
                </div>
                
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                
                <div className="space-y-2">
                  <div className="text-4xl font-bold">
                    R$ {price.toFixed(2).replace('.', ',')}
                    {plan.monthlyPrice > 0 && (
                      <span className="text-lg text-muted-foreground font-normal">
                        /{billingPeriod}
                      </span>
                    )}
                  </div>
                  
                  {plan.savings && isYearly && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      {plan.savings}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features */}
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Limitations for Free Plan */}
                {plan.limitations && (
                  <div className="border-t pt-4">
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Limitações:
                    </p>
                    <ul className="space-y-1">
                      {plan.limitations.map((limitation, index) => (
                        <li key={index} className="text-sm text-muted-foreground">
                          • {limitation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Button */}
                <div className="pt-4">
                  {plan.current ? (
                    <Button disabled className="w-full">
                      Plano Atual
                    </Button>
                  ) : plan.monthlyPrice === 0 ? (
                    <Button variant="outline" className="w-full" disabled>
                      Plano Atual
                    </Button>
                  ) : (
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={() => handleSubscribe(plan.name.toLowerCase())}
                      disabled={loading[plan.name.toLowerCase()]}
                    >
                      {loading[plan.name.toLowerCase()] ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      ) : null}
                      Assinar {plan.name}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">
          Perguntas Frequentes
        </h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">
              Posso cancelar minha assinatura a qualquer momento?
            </h3>
            <p className="text-muted-foreground">
              Sim! Você pode cancelar sua assinatura a qualquer momento através do seu perfil. 
              Você continuará tendo acesso aos recursos premium até o final do período pago.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">
              Há garantia de reembolso?
            </h3>
            <p className="text-muted-foreground">
              Oferecemos garantia de 30 dias para todos os planos pagos. 
              Se não ficar satisfeito, reembolsamos 100% do valor.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">
              Posso fazer upgrade ou downgrade do meu plano?
            </h3>
            <p className="text-muted-foreground">
              Sim! Você pode alterar seu plano a qualquer momento. 
              As alterações entram em vigor imediatamente com ajuste proporcional na cobrança.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Chrome, Zap, Shield, Star } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao Aptix",
      });
      navigate('/');
    } catch (error) {
      console.error("Erro detalhado no login:", error);
      toast({
        title: "Erro no login",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: Zap,
      title: "IA Avançada",
      description: "Geração de conteúdo com tecnologia de ponta"
    },
    {
      icon: Shield,
      title: "Seguro e Confiável",
      description: "Seus dados protegidos com criptografia"
    },
    {
      icon: Star,
      title: "Qualidade Premium",
      description: "Resultados profissionais garantidos"
    }
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-purple-600 text-white p-12 flex-col justify-center">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold mb-4">
            Bem-vindo ao Aptix
          </h1>
          <p className="text-xl mb-8 opacity-90">
            A plataforma completa com IA para impulsionar sua produtividade
          </p>
          
          <div className="space-y-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="text-sm opacity-90">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo for mobile */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <span className="ml-3 font-bold text-2xl gradient-text">Aptix</span>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold">Entrar na sua conta</CardTitle>
              <CardDescription>
                Use sua conta Google para acessar todas as funcionalidades
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <Button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full h-12 text-base font-medium"
                size="lg"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                ) : (
                  <Chrome className="mr-3 h-5 w-5" />
                )}
                Continuar com Google
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Ao continuar, você concorda com nossos{' '}
                  <a href="#" className="text-primary hover:underline">
                    Termos de Uso
                  </a>{' '}
                  e{' '}
                  <a href="#" className="text-primary hover:underline">
                    Política de Privacidade
                  </a>
                </p>
              </div>

              {/* Free Plan Benefits */}
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium text-sm mb-2">Plano Gratuito inclui:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 5 gerações de IA por dia</li>
                  <li>• Acesso a todas as ferramentas</li>
                  <li>• Interface moderna e intuitiva</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;

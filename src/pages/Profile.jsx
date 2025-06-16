
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { 
  User, 
  Mail, 
  Calendar, 
  Crown, 
  Moon, 
  Sun, 
  Settings,
  LogOut,
  CreditCard,
  Shield
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import stripeService from '../services/stripeService';

const Profile = () => {
  const { user, userPlan, signOut, refreshUserData } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [loading, setLoading] = useState({ portal: false, refresh: false });

  const handleManageSubscription = async () => {
    setLoading(prev => ({ ...prev, portal: true }));
    
    try {
      await stripeService.createPortalSession();
    } catch (error) {
      toast({
        title: "Erro ao acessar portal",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, portal: false }));
    }
  };

  const handleRefreshData = async () => {
    setLoading(prev => ({ ...prev, refresh: true }));
    
    try {
      await refreshUserData();
      toast({
        title: "Dados atualizados!",
        description: "Suas informações foram sincronizadas.",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, refresh: false }));
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro no logout",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getPlanInfo = () => {
    const plans = {
      free: {
        name: 'Plano Gratuito',
        color: 'bg-gray-500',
        features: ['5 usos por dia', 'Todas as ferramentas', 'Suporte por email']
      },
      monthly: {
        name: 'Plano Mensal',
        color: 'bg-primary',
        features: ['Uso ilimitado', 'Histórico salvo', 'Exportação PDF', 'Suporte prioritário']
      },
      yearly: {
        name: 'Plano Anual',
        color: 'bg-gradient-to-r from-purple-500 to-pink-500',
        features: ['Tudo do mensal', '33% de desconto', 'Acesso beta', 'Consultoria']
      }
    };

    return plans[userPlan?.plan] || plans.free;
  };

  const planInfo = getPlanInfo();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Perfil</h1>
        <p className="text-muted-foreground">
          Gerencie sua conta e preferências
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações do Usuário */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user?.photoURL} alt={user?.displayName} />
                  <AvatarFallback className="text-lg">
                    {user?.displayName?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-2xl font-bold">{user?.displayName}</h3>
                  <p className="text-muted-foreground">{user?.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Membro desde</p>
                    <p className="text-sm text-muted-foreground">
                      {userPlan?.createdAt ? 
                        new Date(userPlan.createdAt.seconds * 1000).toLocaleDateString('pt-BR') : 
                        'Hoje'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configurações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                Configurações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Tema</Label>
                  <p className="text-sm text-muted-foreground">
                    Alterne entre tema claro e escuro
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Sun className="h-4 w-4" />
                  <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
                  <Moon className="h-4 w-4" />
                </div>
              </div>

              <hr />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Sincronizar Dados</Label>
                  <p className="text-sm text-muted-foreground">
                    Atualizar informações da conta
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleRefreshData}
                  disabled={loading.refresh}
                >
                  {loading.refresh ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                  ) : null}
                  Atualizar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Segurança */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Segurança
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Sair da Conta</Label>
                  <p className="text-sm text-muted-foreground">
                    Desconectar de todos os dispositivos
                  </p>
                </div>
                <Button variant="outline" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Plano e Estatísticas */}
        <div className="space-y-6">
          {/* Plano Atual */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Crown className="mr-2 h-5 w-5" />
                Plano Atual
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <Badge className={`${planInfo.color} text-white px-4 py-2`}>
                  {planInfo.name}
                </Badge>
              </div>

              <div className="space-y-2">
                {planInfo.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                    {feature}
                  </div>
                ))}
              </div>

              {userPlan?.plan !== 'free' ? (
                <div className="space-y-3">
                  {userPlan?.planExpiry && (
                    <p className="text-sm text-muted-foreground text-center">
                      Válido até: {new Date(userPlan.planExpiry.seconds * 1000).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                  
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={handleManageSubscription}
                    disabled={loading.portal}
                  >
                    {loading.portal ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                    ) : (
                      <CreditCard className="mr-2 h-4 w-4" />
                    )}
                    Gerenciar Assinatura
                  </Button>
                </div>
              ) : (
                <Button className="w-full" asChild>
                  <a href="/pricing">
                    <Crown className="mr-2 h-4 w-4" />
                    Fazer Upgrade
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Estatísticas de Uso */}
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {userPlan?.dailyUsage || 0}
                </div>
                <p className="text-sm text-muted-foreground">
                  {userPlan?.plan === 'free' ? 'usos hoje (máx. 5)' : 'usos hoje'}
                </p>
              </div>

              {userPlan?.plan === 'free' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso diário</span>
                    <span>{userPlan?.dailyUsage || 0}/5</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ 
                        width: `${((userPlan?.dailyUsage || 0) / 5) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;


import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  FileText, 
  Mail, 
  MessageSquare, 
  Bot, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Clock,
  Crown,
  Zap
} from 'lucide-react';

const Dashboard = () => {
  const { user, userPlan } = useAuth();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Bom dia');
    else if (hour < 18) setGreeting('Boa tarde');
    else setGreeting('Boa noite');
  }, []);

  const aiTools = [
    {
      title: 'Gerador de Currículos',
      description: 'Crie currículos profissionais com IA',
      icon: FileText,
      href: '/ai/curriculum',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Cartas de Apresentação',
      description: 'Cartas personalizadas e impactantes',
      icon: Mail,
      href: '/ai/cover-letter',
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Atendimento ao Cliente',
      description: 'Respostas profissionais para seu negócio',
      icon: MessageSquare,
      href: '/ai/customer-service',
      color: 'from-purple-500 to-violet-500'
    },
    {
      title: 'Bot IA Universal',
      description: 'Assistente inteligente para tudo',
      icon: Bot,
      href: '/ai/bot',
      color: 'from-orange-500 to-red-500'
    }
  ];

  const stats = [
    {
      title: 'Usos Hoje',
      value: userPlan?.dailyUsage || 0,
      limit: userPlan?.plan === 'free' ? 5 : '∞',
      icon: Zap,
      description: userPlan?.plan === 'free' ? 'do limite gratuito' : 'uso ilimitado'
    },
    {
      title: 'Plano Atual',
      value: userPlan?.plan === 'free' ? 'Gratuito' : 
             userPlan?.plan === 'monthly' ? 'Mensal' : 'Anual',
      icon: Crown,
      description: 'sua assinatura'
    },
    {
      title: 'Membro desde',
      value: userPlan?.createdAt ? 
             new Date(userPlan.createdAt.seconds * 1000).toLocaleDateString('pt-BR') : 
             'Hoje',
      icon: Users,
      description: 'bem-vindo!'
    }
  ];

  const quickActions = [
    { title: 'Gerar Currículo', href: '/ai/curriculum', icon: FileText },
    { title: 'Finanças', href: '/finances', icon: DollarSign },
    { title: 'Histórico', href: '/history', icon: Clock },
    { title: 'Upgrade', href: '/pricing', icon: Crown }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold">
            {greeting}, {user?.displayName?.split(' ')[0]}! 👋
          </h1>
          <p className="text-muted-foreground">
            Pronto para aumentar sua produtividade hoje?
          </p>
        </div>
        
        {userPlan?.plan === 'free' && (
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-orange-600 border-orange-600">
              Plano Gratuito
            </Badge>
            <Button asChild size="sm">
              <Link to="/pricing">
                <Crown className="mr-2 h-4 w-4" />
                Fazer Upgrade
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stat.value}
                  {stat.limit && (
                    <span className="text-sm text-muted-foreground">
                      /{stat.limit}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* AI Tools */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Ferramentas de IA</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {aiTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link key={tool.href} to={tool.href}>
                <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${tool.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{tool.title}</CardTitle>
                    <CardDescription>{tool.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Ações Rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.href}
                asChild
                variant="outline"
                className="h-20 flex flex-col space-y-2"
              >
                <Link to={action.href}>
                  <Icon className="h-5 w-5" />
                  <span className="text-sm">{action.title}</span>
                </Link>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Suas atividades recentes aparecerão aqui
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;

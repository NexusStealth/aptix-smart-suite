
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { 
  Home, 
  FileText, 
  Mail, 
  MessageSquare, 
  Bot, 
  DollarSign, 
  History, 
  Crown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from './ui/button';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const menuItems = [
    {
      title: 'Dashboard',
      icon: Home,
      href: '/',
    },
    {
      title: 'Gerador de Currículos',
      icon: FileText,
      href: '/ai/curriculum',
    },
    {
      title: 'Cartas de Apresentação',
      icon: Mail,
      href: '/ai/cover-letter',
    },
    {
      title: 'Atendimento ao Cliente',
      icon: MessageSquare,
      href: '/ai/customer-service',
    },
    {
      title: 'Documentos Inteligentes',
      icon: FileText,
      href: '/ai/documents',
    },
    {
      title: 'Bot IA Universal',
      icon: Bot,
      href: '/ai/bot',
    },
    {
      title: 'Finanças Pessoais',
      icon: DollarSign,
      href: '/finances',
    },
    {
      title: 'Histórico',
      icon: History,
      href: '/history',
    },
    {
      title: 'Planos',
      icon: Crown,
      href: '/pricing',
    },
  ];

  return (
    <div className={cn(
      "fixed left-0 top-14 h-[calc(100vh-3.5rem)] bg-card border-r transition-all duration-300 z-40",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Collapse Button */}
      <div className="flex justify-end p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 p-0"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Menu Items */}
      <nav className="space-y-1 px-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                isActive && "bg-accent text-accent-foreground font-medium"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && (
                <span className="truncate">{item.title}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Upgrade Banner (for free users) */}
      {!collapsed && (
        <div className="absolute bottom-4 left-2 right-2">
          <div className="bg-gradient-to-r from-primary to-purple-600 rounded-lg p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-4 w-4" />
              <span className="font-medium text-sm">Upgrade</span>
            </div>
            <p className="text-xs opacity-90 mb-3">
              Desbloqueie recursos premium e uso ilimitado
            </p>
            <Button 
              asChild 
              size="sm" 
              className="w-full bg-white text-primary hover:bg-gray-100"
            >
              <Link to="/pricing">Ver Planos</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;

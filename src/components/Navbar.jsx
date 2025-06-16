
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from './ui/dropdown-menu';
import { Sun, Moon, User, LogOut, Settings, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const { user, userPlan, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const getPlanBadge = () => {
    if (!userPlan) return null;
    
    const badges = {
      free: { text: 'Gratuito', color: 'bg-gray-500' },
      monthly: { text: 'Mensal', color: 'bg-primary' },
      yearly: { text: 'Anual', color: 'bg-gradient-to-r from-purple-500 to-pink-500' }
    };
    
    const badge = badges[userPlan.plan];
    if (!badge) return null;
    
    return (
      <span className={`text-xs px-2 py-1 rounded-full text-white ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="font-bold text-xl gradient-text">Aptix</span>
        </Link>
        
        {/* Spacer */}
        <div className="flex-1" />
        
        {/* User Actions */}
        <div className="flex items-center space-x-4">
          {/* Plan Badge */}
          {getPlanBadge()}
          
          {/* Usage Counter for Free Plan */}
          {userPlan?.plan === 'free' && (
            <div className="text-sm text-muted-foreground">
              {userPlan.dailyUsage || 0}/5 usos hoje
            </div>
          )}
          
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="w-9 h-9 p-0"
          >
            {theme === 'light' ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Button>
          
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.photoURL} alt={user?.displayName} />
                  <AvatarFallback>
                    {user?.displayName?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium text-sm">{user?.displayName}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/pricing" className="cursor-pointer">
                  <Crown className="mr-2 h-4 w-4" />
                  Planos
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="cursor-pointer text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { ChevronDown, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface HeaderProps {
  projectName?: string;
  projectDomain?: string;
}

export function Header({ projectName, projectDomain }: HeaderProps) {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast({
      title: t('success'),
      description: "Вы успешно вышли из системы.",
    });
  };

  const goToSettings = () => {
    setLocation('/settings');
    setShowProfileMenu(false);
  };

  const goToDashboard = () => {
    setLocation('/projects');
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <Link href="/projects">
                <h1 className="text-lg font-bold text-slate-900 cursor-pointer hover:text-slate-700 transition-colors">
                  LinkForge
                </h1>
              </Link>
            </div>
            {projectName && (
              <div className="hidden md:block text-slate-500">
                <span className="text-xs">Проект: </span>
                <span className="font-medium text-slate-700">{projectName}</span>
                {projectDomain && (
                  <span className="text-xs text-slate-400 ml-2">{projectDomain}</span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 p-1 rounded-full hover:bg-slate-100 transition-colors"
              >
                <img 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=32&h=32" 
                  alt="User avatar" 
                  className="w-8 h-8 rounded-full object-cover"
                />
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200">
                  <div className="py-1">
                    <button 
                      onClick={goToSettings}
                      className="flex items-center w-full px-3 py-2 text-sm hover:bg-slate-50"
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      {t('settings')}
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center w-full px-3 py-2 text-sm hover:bg-slate-50 text-red-600"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      {t('logout')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

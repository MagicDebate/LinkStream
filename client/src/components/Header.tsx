import { useState } from 'react';
import { ChevronDown, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface HeaderProps {
  projectName?: string;
  projectDomain?: string;
}

export function Header({ projectName, projectDomain }: HeaderProps) {
  const { user, logout, changePassword } = useAuth();
  const { toast } = useToast();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const handleLogout = async () => {
    await logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  const handleChangePassword = async () => {
    if (passwordForm.new !== passwordForm.confirm) {
      toast({
        title: "Error",
        description: "New passwords don't match.",
        variant: "destructive",
      });
      return;
    }

    try {
      await changePassword(passwordForm.current, passwordForm.new);
      toast({
        title: "Success",
        description: "Password changed successfully.",
      });
      setPasswordForm({ current: '', new: '', confirm: '' });
      setShowSettings(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to change password.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <h1 className="text-lg font-bold text-slate-900">LinkForge</h1>
              </div>
              {projectName && (
                <div className="hidden md:block text-slate-500">
                  <span className="text-xs">Project: </span>
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
                        onClick={() => {
                          setShowSettings(!showSettings);
                          setShowProfileMenu(false);
                        }}
                        className="flex items-center w-full px-3 py-2 text-sm hover:bg-slate-50"
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        Settings
                      </button>
                      <button 
                        onClick={handleLogout}
                        className="flex items-center w-full px-3 py-2 text-sm hover:bg-slate-50 text-red-600"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {showSettings && (
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="max-w-md">
              <h3 className="font-medium text-slate-900 mb-3">Change Password</h3>
              <div className="space-y-3">
                <div>
                  <Label className="block text-xs font-medium text-slate-700 mb-1">Email</Label>
                  <Input type="email" value={user?.email || ''} disabled className="bg-slate-50" />
                </div>
                <div>
                  <Label className="block text-xs font-medium text-slate-700 mb-1">Current Password</Label>
                  <Input 
                    type="password" 
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, current: e.target.value }))}
                  />
                </div>
                <div>
                  <Label className="block text-xs font-medium text-slate-700 mb-1">New Password</Label>
                  <Input 
                    type="password" 
                    value={passwordForm.new}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, new: e.target.value }))}
                  />
                </div>
                <div>
                  <Label className="block text-xs font-medium text-slate-700 mb-1">Confirm New Password</Label>
                  <Input 
                    type="password" 
                    value={passwordForm.confirm}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm: e.target.value }))}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleChangePassword} className="text-sm font-medium">
                    Save
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowSettings(false)} 
                    className="text-sm font-medium"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

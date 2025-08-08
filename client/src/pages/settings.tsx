import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
  const { user, changePassword } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.new !== passwordForm.confirm) {
      toast({
        title: t('error'),
        description: t('passwordsDontMatch'),
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword(passwordForm.current, passwordForm.new);
      toast({
        title: t('success'),
        description: t('passwordChanged'),
      });
      setPasswordForm({ current: '', new: '', confirm: '' });
    } catch (error) {
      toast({
        title: t('error'),
        description: error instanceof Error ? error.message : t('incorrectPassword'),
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">{t('settings')}</h1>
          <p className="text-slate-600">Управление настройками аккаунта</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle>Информация профиля</CardTitle>
              <CardDescription>
                Основная информация о вашем аккаунте
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-slate-700">{t('email')}</Label>
                <Input value={user?.email || ''} disabled className="bg-slate-50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-slate-700">{t('firstName')}</Label>
                  <Input value={user?.firstName || ''} disabled className="bg-slate-50" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">{t('lastName')}</Label>
                  <Input value={user?.lastName || ''} disabled className="bg-slate-50" />
                </div>
              </div>
              <div className="text-xs text-slate-500">
                Дата регистрации: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('ru-RU') : '—'}
              </div>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle>{t('changePassword')}</CardTitle>
              <CardDescription>
                Обновите пароль для защиты аккаунта
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-slate-700">{t('currentPassword')}</Label>
                  <Input 
                    type="password" 
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, current: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">{t('newPassword')}</Label>
                  <Input 
                    type="password" 
                    value={passwordForm.new}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, new: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">{t('confirmPassword')}</Label>
                  <Input 
                    type="password" 
                    value={passwordForm.confirm}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm: e.target.value }))}
                    required
                  />
                </div>
                <Button type="submit" disabled={isChangingPassword} className="w-full">
                  {isChangingPassword ? t('saving') : t('save')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Additional Settings Sections */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notification Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Уведомления</CardTitle>
              <CardDescription>
                Настройте предпочтения уведомлений
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">Email уведомления</div>
                  <div className="text-xs text-slate-500">Получать уведомления о завершении генерации</div>
                </div>
                <input type="checkbox" className="toggle" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">Еженедельные отчеты</div>
                  <div className="text-xs text-slate-500">Сводки по активности проектов</div>
                </div>
                <input type="checkbox" className="toggle" />
              </div>
            </CardContent>
          </Card>

          {/* Language & Region */}
          <Card>
            <CardHeader>
              <CardTitle>Язык и регион</CardTitle>
              <CardDescription>
                Настройки локализации
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-slate-700">Язык интерфейса</Label>
                <select className="w-full mt-1 p-2 border border-slate-300 rounded-md bg-white">
                  <option value="ru">Русский</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-700">Часовой пояс</Label>
                <select className="w-full mt-1 p-2 border border-slate-300 rounded-md bg-white">
                  <option value="Europe/Moscow">Москва (UTC+3)</option>
                  <option value="Europe/Kiev">Киев (UTC+2)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
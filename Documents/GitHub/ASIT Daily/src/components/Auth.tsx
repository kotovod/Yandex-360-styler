import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Mail, Lock, User, Key, ArrowLeft, Send } from 'lucide-react';

type ViewMode = 'login' | 'register' | 'verify-email' | 'forgot-password' | 'reset-password';

export default function Auth() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<ViewMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPasswordLink, setShowForgotPasswordLink] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (!result.success) {
        // Проверяем, нужно ли подтвердить email
        const errorData = result as any;
        if (errorData.code === 'EMAIL_NOT_VERIFIED') {
          setError('Email не подтвержден. Введите код из письма.');
          setMode('verify-email');
        } else {
          setError(result.error || 'Ошибка входа');
        }
      }
    } catch (err) {
      setError('Произошла ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setShowForgotPasswordLink(false);
    setIsLoading(true);

    try {
      const result = await register(email, password, name);
      if (result.success) {
        setSuccess('Код подтверждения отправлен на ваш email');
        setMode('verify-email');
      } else {
        setError(result.error || 'Ошибка регистрации');
        
        // Если пользователь уже существует, показываем кнопку восстановления
        if (result.code === 'USER_EXISTS' && result.suggestion === 'forgot_password') {
          setShowForgotPasswordLink(true);
        }
      }
    } catch (err) {
      setError('Произошла ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await api.verifyEmail(email, verificationCode);
      if (response.data) {
        setSuccess('Email успешно подтверждён! Входим...');
        // Теперь нужно войти с этими данными
        setTimeout(async () => {
          const loginResult = await login(email, password);
          if (loginResult.success) {
            window.location.reload();
          } else {
            setError('Email подтверждён, но ошибка входа. Попробуйте войти вручную.');
            setMode('login');
          }
        }, 1000);
      } else {
        setError(response.error || 'Неверный код');
      }
    } catch (err) {
      setError('Произошла ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await api.resendVerification(email);
      if (response.data) {
        setSuccess('Код отправлен повторно');
      } else {
        setError(response.error || 'Ошибка отправки');
      }
    } catch (err) {
      setError('Произошла ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await api.forgotPassword(email);
      if (response.data) {
        setSuccess('Код восстановления отправлен на email');
        setMode('reset-password');
      } else {
        setError(response.error || 'Ошибка отправки');
      }
    } catch (err) {
      setError('Произошла ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await api.resetPassword(email, verificationCode, newPassword);
      if (response.data) {
        setSuccess('Пароль успешно изменён! Теперь войдите с новым паролем.');
        setTimeout(() => {
          setMode('login');
          setPassword('');
          setVerificationCode('');
          setNewPassword('');
        }, 2000);
      } else {
        setError(response.error || 'Ошибка сброса пароля');
      }
    } catch (err) {
      setError('Произошла ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            АСИТ Дейли
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Контроль аллерген-специфической иммунотерапии
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          {/* Login / Register Toggle */}
          {(mode === 'login' || mode === 'register') && (
            <div className="flex mb-6 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
              <button
                onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                  mode === 'login'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Вход
              </button>
              <button
                onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                  mode === 'register'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Регистрация
              </button>
            </div>
          )}

          {/* Back Button for other modes */}
          {mode !== 'login' && mode !== 'register' && (
            <button
              onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
              className="flex items-center text-blue-concentration mb-6 hover:underline"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад к входу
            </button>
          )}

          {/* Login Form */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Пароль
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div className="text-right">
                <button
                  type="button"
                  onClick={() => { setMode('forgot-password'); setError(''); setSuccess(''); }}
                  className="text-sm text-blue-concentration hover:underline"
                >
                  Забыли пароль?
                </button>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-blue-concentration text-white rounded-xl font-semibold
                  transform transition-all duration-200 active:scale-95 touch-manipulation
                  disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isLoading ? 'Загрузка...' : 'Войти'}
              </button>
            </form>
          )}

          {/* Register Form */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Имя
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Ваше имя"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Пароль
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 rounded-xl">
                  <p className="text-red-700 dark:text-red-400 text-sm mb-2">
                    {error}
                  </p>
                  {showForgotPasswordLink && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot-password');
                        setError('');
                        setShowForgotPasswordLink(false);
                      }}
                      className="text-sm text-red-800 dark:text-red-300 font-semibold hover:underline flex items-center"
                    >
                      → Восстановить пароль
                    </button>
                  )}
                </div>
              )}

              {success && (
                <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-4 py-3 rounded-xl text-sm">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-blue-concentration text-white rounded-xl font-semibold
                  transform transition-all duration-200 active:scale-95 touch-manipulation
                  disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isLoading ? 'Загрузка...' : 'Зарегистрироваться'}
              </button>
            </form>
          )}

          {/* Verify Email Form */}
          {mode === 'verify-email' && (
            <form onSubmit={handleVerifyEmail} className="space-y-4">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-blue-concentration" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Подтвердите email
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Мы отправили код на <strong>{email}</strong>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Код подтверждения
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center text-2xl tracking-widest"
                    placeholder="000000"
                    required
                    maxLength={6}
                    pattern="[0-9]{6}"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-4 py-3 rounded-xl text-sm">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || verificationCode.length !== 6}
                className="w-full py-3 px-4 bg-blue-concentration text-white rounded-xl font-semibold
                  transform transition-all duration-200 active:scale-95 touch-manipulation
                  disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isLoading ? 'Проверка...' : 'Подтвердить'}
              </button>

              <button
                type="button"
                onClick={handleResendCode}
                disabled={isLoading}
                className="w-full py-2 text-sm text-blue-concentration hover:underline disabled:opacity-50"
              >
                Отправить код повторно
              </button>
            </form>
          )}

          {/* Forgot Password Form */}
          {mode === 'forgot-password' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Восстановление пароля
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Введите email для получения кода восстановления
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-4 py-3 rounded-xl text-sm">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold
                  transform transition-all duration-200 active:scale-95 touch-manipulation
                  disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center space-x-2"
              >
                <Send className="w-5 h-5" />
                <span>{isLoading ? 'Отправка...' : 'Отправить код'}</span>
              </button>
            </form>
          )}

          {/* Reset Password Form */}
          {mode === 'reset-password' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Key className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Новый пароль
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Введите код из email и новый пароль
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Код из email
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center text-2xl tracking-widest"
                    placeholder="000000"
                    required
                    maxLength={6}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Новый пароль
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-4 py-3 rounded-xl text-sm">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || verificationCode.length !== 6}
                className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold
                  transform transition-all duration-200 active:scale-95 touch-manipulation
                  disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isLoading ? 'Сохранение...' : 'Сохранить новый пароль'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          Для работы приложения необходимо подключение к интернету
        </p>
      </div>
    </div>
  );
}

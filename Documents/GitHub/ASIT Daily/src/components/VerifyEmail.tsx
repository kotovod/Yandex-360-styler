import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Loader, CheckCircle } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function VerifyEmail() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.email || code.length !== 6) {
      setError('Введите 6-значный код');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await api.verifyEmail(user.email, code);
      
      if (response.error) {
        setError(response.error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (err) {
      setError('Ошибка подтверждения');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!user?.email) return;

    setResending(true);
    setError('');

    try {
      const response = await api.resendVerification(user.email);
      
      if (response.error) {
        setError(response.error);
      } else {
        setError('');
        alert('Код отправлен повторно!');
      }
    } catch (err) {
      setError('Ошибка отправки кода');
    } finally {
      setResending(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Email подтверждён!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Перенаправление...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
              <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Подтвердите email
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Мы отправили код подтверждения на<br />
              <strong>{user?.email}</strong>
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Код подтверждения
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  text-center text-2xl tracking-widest font-mono"
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || code.length !== 6}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold
                transform transition-all duration-200 active:scale-95 touch-manipulation
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Проверка...</span>
                </>
              ) : (
                <span>Подтвердить</span>
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm disabled:opacity-50"
              >
                {resending ? 'Отправка...' : 'Отправить код повторно'}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-gray-600 dark:text-gray-400 hover:underline text-sm"
              >
                Пропустить сейчас
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useTherapy } from '../contexts/TherapyContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import { Bell, BellOff, Calendar, LogOut, Save } from 'lucide-react';
import ExportData from './ExportData';

export default function Settings() {
  const { therapySession, startTherapy } = useTherapy();
  const { logout, user } = useAuth();
  const { permission, requestPermission, isSupported } = useNotifications();

  const [startDate, setStartDate] = useState(
    therapySession?.startDate || new Date().toISOString().split('T')[0]
  );
  const [maintenanceDose, setMaintenanceDose] = useState(
    therapySession?.maintenanceDose || 3
  );
  const [reminderTime, setReminderTime] = useState(
    therapySession?.reminderTime || '09:00'
  );
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    setIsSaving(true);
    setMessage('');

    try {
      const success = await startTherapy(startDate, maintenanceDose, reminderTime);
      if (success) {
        setMessage('Настройки сохранены');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Ошибка сохранения');
      }
    } catch (error) {
      setMessage('Ошибка сохранения');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      setMessage('Уведомления включены');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <div className="max-w-md mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Настройки
        </h1>

        {/* User Info */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-3">
            Профиль
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {user?.name}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {user?.email}
          </p>
        </div>

        {/* Therapy Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
            Параметры терапии
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="inline w-4 h-4 mr-2" />
                Дата начала терапии
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={!!therapySession}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {therapySession && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Дату начала нельзя изменить после запуска терапии
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Поддерживающая доза (нажатий)
              </label>
              <select
                value={maintenanceDose}
                onChange={(e) => setMaintenanceDose(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {[2, 3, 4].map((dose) => (
                  <option key={dose} value={dose}>
                    {dose} нажатий
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Рекомендовано: 2-4 нажатия ежедневно (300 ИР/мл)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Время напоминания
              </label>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {message && (
              <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-4 py-3 rounded-xl text-sm">
                {message}
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full py-3 px-4 bg-blue-concentration text-white rounded-xl font-semibold
                flex items-center justify-center space-x-2
                transform transition-all duration-200 active:scale-95 touch-manipulation
                disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              <Save className="w-5 h-5" />
              <span>{isSaving ? 'Сохранение...' : 'Сохранить'}</span>
            </button>
          </div>
        </div>

        {/* Notifications */}
        {isSupported && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
              Уведомления
            </h2>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {permission === 'granted' ? (
                  <Bell className="w-5 h-5 text-green-500" />
                ) : (
                  <BellOff className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Push-уведомления
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {permission === 'granted'
                      ? 'Включены'
                      : permission === 'denied'
                      ? 'Отклонены'
                      : 'Не активированы'}
                  </p>
                </div>
              </div>

              {permission !== 'granted' && permission !== 'denied' && (
                <button
                  onClick={handleEnableNotifications}
                  className="px-4 py-2 bg-blue-concentration text-white rounded-lg text-sm font-medium
                    active:scale-95 transition-transform touch-manipulation"
                >
                  Включить
                </button>
              )}
            </div>

            {permission === 'denied' && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                Разрешите уведомления в настройках браузера
              </p>
            )}
          </div>
        )}

        {/* Export Data */}
        <ExportData />

        {/* Instructions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
            📖 Инструкция к препарату
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Официальная инструкция по применению препарата Сталораль «Аллерген пыльцы берёзы»
          </p>
          <a
            href="https://www.stallergenesgreer.com/sites/default/files/affiliates/ru/staloral_allergen_pylcy_berezy_imp.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold
              flex items-center justify-center space-x-2
              hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors touch-manipulation"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Открыть инструкцию (PDF)</span>
          </a>
          
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <p className="text-xs text-gray-700 dark:text-gray-300">
              ⚠️ <strong>Важно:</strong> Перед началом терапии обязательно ознакомьтесь с инструкцией и проконсультируйтесь с врачом-аллергологом.
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="w-full py-3 px-4 bg-red-500 text-white rounded-xl font-semibold
            flex items-center justify-center space-x-2
            transform transition-all duration-200 active:scale-95 touch-manipulation shadow-lg"
        >
          <LogOut className="w-5 h-5" />
          <span>Выйти</span>
        </button>
      </div>
    </div>
  );
}

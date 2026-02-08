import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTherapy } from '@/contexts/TherapyContext';
import { useNotifications } from '@/hooks/useNotifications';
import { Settings as SettingsIcon, Bell, Calendar, LogOut, User, Clock } from 'lucide-react';

export default function Settings() {
  const { user, logout } = useAuth();
  const { therapy, startTherapy, updateMaintenanceDose } = useTherapy();
  const notifications = useNotifications();

  const [showStartTherapy, setShowStartTherapy] = useState(!therapy);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [maintenanceDose, setMaintenanceDose] = useState(therapy?.maintenanceDose || 6);
  const [loading, setLoading] = useState(false);

  const handleStartTherapy = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await startTherapy(startDate, reminderTime);
      setShowStartTherapy(false);
    } catch (error) {
      console.error('Error starting therapy:', error);
      alert('Ошибка при начале терапии');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMaintenanceDose = async () => {
    setLoading(true);
    try {
      await updateMaintenanceDose(maintenanceDose);
      alert('Доза обновлена');
    } catch (error) {
      console.error('Error updating maintenance dose:', error);
      alert('Ошибка при обновлении дозы');
    } finally {
      setLoading(false);
    }
  };

  const handleEnableNotifications = async () => {
    const granted = await notifications.requestPermission();
    if (granted) {
      const subscription = await notifications.subscribeToPush();
      if (subscription) {
        alert('Уведомления включены');
      }
    }
  };

  return (
    <div className="p-6 pb-24">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
        <SettingsIcon className="w-7 h-7 mr-2" />
        Настройки
      </h2>

      {/* User Info */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-5 mb-4">
        <div className="flex items-center mb-4">
          <User className="w-5 h-5 text-gray-500 mr-3" />
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{user?.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center py-3 px-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-medium rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Выйти
        </button>
      </div>

      {/* Start Therapy Form */}
      {showStartTherapy ? (
        <form onSubmit={handleStartTherapy} className="bg-white dark:bg-gray-800 rounded-2xl shadow p-5 mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Начало терапии
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Дата начала
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Время напоминания
              </label>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Сохранение...' : 'Начать терапию'}
            </button>
          </div>
        </form>
      ) : (
        <>
          {/* Therapy Info */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-5 mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Информация о терапии
            </h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Дата начала:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {therapy && new Date(therapy.startDate).toLocaleDateString('ru-RU')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Время напоминания:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {therapy?.reminderTime}
                </span>
              </div>
            </div>
          </div>

          {/* Maintenance Dose */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-5 mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Поддерживающая доза
            </h3>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Количество нажатий в поддерживающей фазе (обычно 4-8)
            </p>

            <div className="flex items-center gap-4">
              <input
                type="number"
                min="4"
                max="8"
                value={maintenanceDose}
                onChange={(e) => setMaintenanceDose(parseInt(e.target.value))}
                className="flex-1 p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleUpdateMaintenanceDose}
                disabled={loading}
                className="px-6 py-3 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                Сохранить
              </button>
            </div>
          </div>
        </>
      )}

      {/* Notifications */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-5 mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Bell className="w-5 h-5 mr-2" />
          Уведомления
        </h3>

        {!notifications.supported && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Уведомления не поддерживаются в вашем браузере
          </p>
        )}

        {notifications.supported && notifications.permission === 'default' && (
          <button
            onClick={handleEnableNotifications}
            className="w-full py-3 px-4 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-colors"
          >
            Включить уведомления
          </button>
        )}

        {notifications.supported && notifications.permission === 'granted' && (
          <div className="flex items-center justify-between">
            <span className="text-green-600 dark:text-green-400 font-medium">
              ✓ Уведомления включены
            </span>
            <button
              onClick={() => notifications.unsubscribeFromPush()}
              className="text-sm text-red-600 dark:text-red-400 hover:underline"
            >
              Отключить
            </button>
          </div>
        )}

        {notifications.supported && notifications.permission === 'denied' && (
          <p className="text-sm text-red-600 dark:text-red-400">
            Уведомления заблокированы. Разрешите их в настройках браузера.
          </p>
        )}
      </div>
    </div>
  );
}

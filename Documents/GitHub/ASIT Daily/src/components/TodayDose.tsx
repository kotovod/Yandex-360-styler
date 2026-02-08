import { useState } from 'react';
import { CheckCircle, XCircle, Plus, AlertTriangle } from 'lucide-react';
import { useDoseSchedule } from '../hooks/useDoseSchedule';
import { useTherapy } from '../contexts/TherapyContext';
import { getPhaseProgress, getPhaseLabel } from '../utils/doseCalculator';
import SideEffects from './SideEffects';

export default function TodayDose() {
  const { therapySession, todayDose, takeDose, isLoading, refreshTherapy } = useTherapy();
  const doseInfo = useDoseSchedule(
    therapySession?.startDate || null,
    therapySession?.maintenanceDose || 3
  );
  
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [isTaking, setIsTaking] = useState(false);
  const [showSideEffects, setShowSideEffects] = useState(false);

  const handleTakeDose = async () => {
    if (!doseInfo || isTaking) return;
    
    setIsTaking(true);
    const success = await takeDose(
      doseInfo.clicks,
      doseInfo.concentration,
      notes || undefined
    );
    
    if (success) {
      setNotes('');
      setShowNotes(false);
    }
    setIsTaking(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    );
  }

  if (!therapySession || !doseInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Терапия не начата</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Начните курс АСИТ-терапии в настройках
          </p>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 text-left mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              📋 Схема приёма Сталораль:
            </h3>
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <div>
                <strong>День 1-5:</strong> Флакон с голубой крышкой (10 ИР/мл)<br/>
                От 1 до 5 нажатий
              </div>
              <div>
                <strong>День 6-9:</strong> Флакон с фиолетовой крышкой (300 ИР/мл)<br/>
                От 1 до 4 нажатий
              </div>
              <div>
                <strong>День 10+:</strong> Фиолетовая крышка (300 ИР/мл)<br/>
                Постоянная доза 2-4 нажатия ежедневно
              </div>
            </div>
          </div>

          <a
            href="https://www.stallergenesgreer.com/sites/default/files/affiliates/ru/staloral_allergen_pylcy_berezy_imp.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Читать полную инструкцию</span>
          </a>
        </div>
      </div>
    );
  }

  const phaseProgress = getPhaseProgress(doseInfo.phase, doseInfo.dayOfTherapy);
  const phaseLabel = getPhaseLabel(doseInfo.phase);
  const colorClass = doseInfo.color === 'blue' ? 'bg-blue-concentration' : 'bg-purple-concentration';
  
  // Форматируем дату на русском языке
  const today = new Date();
  const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  const todayFormatted = `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            АСИТ Дейли
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{todayFormatted}</p>
        </div>

        {/* Phase Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {phaseLabel}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              День {doseInfo.dayOfTherapy}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
            <div
              className={`${colorClass} h-3 rounded-full transition-all duration-500`}
              style={{ width: `${Math.min(phaseProgress, 100)}%` }}
            />
          </div>
          {doseInfo.phase !== 'maintenance' && (
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              {Math.round(phaseProgress)}% завершено
            </p>
          )}
        </div>

        {/* Dose Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-6">
          <div className="text-center mb-6">
            <div className={`inline-block ${colorClass} text-white px-4 py-2 rounded-full text-sm font-semibold mb-4`}>
              {doseInfo.concentration}
            </div>
            <div className="text-6xl font-bold text-gray-900 dark:text-white mb-2">
              {doseInfo.clicks}
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              нажатий на дозатор
            </p>
            <p className={`text-xs font-medium ${doseInfo.color === 'blue' ? 'text-blue-concentration' : 'text-purple-concentration'}`}>
              Флакон с {doseInfo.color === 'blue' ? 'голубой' : 'фиолетовой'} крышкой
            </p>
          </div>

          {/* Take Dose Button */}
          {todayDose?.taken ? (
            <div className="flex items-center justify-center space-x-2 py-4 px-6 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl">
              <CheckCircle className="w-6 h-6" />
              <span className="font-semibold">Препарат принят</span>
            </div>
          ) : (
            <button
              onClick={handleTakeDose}
              disabled={isTaking}
              className={`w-full py-4 px-6 ${colorClass} text-white rounded-xl font-semibold text-lg
                transform transition-all duration-200 active:scale-95 touch-manipulation
                disabled:opacity-50 disabled:cursor-not-allowed shadow-lg`}
            >
              {isTaking ? 'Сохранение...' : 'Принял препарат'}
            </button>
          )}

          {/* Notes Button */}
          {!todayDose?.taken && (
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="w-full mt-3 py-2 px-4 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 
                rounded-xl font-medium text-sm flex items-center justify-center space-x-2 
                hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors touch-manipulation"
            >
              <Plus className="w-4 h-4" />
              <span>Добавить заметку</span>
            </button>
          )}

          {showNotes && (
            <div className="mt-4">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Заметка о приёме (необязательно)"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl 
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows={3}
              />
            </div>
          )}
        </div>

        {/* Today's Dose Info */}
        {todayDose && todayDose.taken && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Сегодняшний приём
              </h3>
              <button
                onClick={() => setShowSideEffects(true)}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-orange-600 dark:text-orange-400 
                  border border-orange-300 dark:border-orange-600 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20
                  transition-colors touch-manipulation"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Побочный эффект</span>
              </button>
            </div>
            <div className="space-y-2 text-sm">
              {todayDose.notes && (
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Заметка: </span>
                  <span className="text-gray-900 dark:text-white">{todayDose.notes}</span>
                </div>
              )}
              <div>
                <span className="text-gray-600 dark:text-gray-400">Доза: </span>
                <span className="text-gray-900 dark:text-white">
                  {todayDose.doseCount} нажатий ({todayDose.concentration})
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Side Effects Modal */}
      {showSideEffects && todayDose && (
        <SideEffects
          doseRecordId={todayDose.id}
          onClose={() => setShowSideEffects(false)}
          onSuccess={refreshTherapy}
        />
      )}
    </div>
  );
}

import { useState } from 'react';
import { useTherapy } from '@/contexts/TherapyContext';
import { getPhaseProgress, getPhaseName } from '@/hooks/useDoseSchedule';
import { Pill, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale/ru';

export default function TodayDose() {
  const { currentDose, therapy, takeDose, skipDose, doses } = useTherapy();
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!therapy || !currentDose) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <Pill className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-gray-500 text-center">
          Начните терапию в разделе настроек
        </p>
      </div>
    );
  }

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayDose = doses.find((d) => d.date.startsWith(today));
  const alreadyTaken = todayDose?.taken;

  const handleTakeDose = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      await takeDose(notes || undefined);
      setNotes('');
      setShowNotes(false);
    } catch (error) {
      console.error('Error taking dose:', error);
      alert('Ошибка при отметке приёма. Попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipDose = async () => {
    if (loading) return;
    
    const confirmed = confirm('Вы уверены, что хотите пропустить приём?');
    if (!confirmed) return;

    setLoading(true);
    try {
      await skipDose();
    } catch (error) {
      console.error('Error skipping dose:', error);
      alert('Ошибка. Попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  const progress = getPhaseProgress(currentDose.dayOfTherapy);
  const colorClasses = {
    blue: {
      bg: 'bg-blue-500',
      bgLight: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-500',
      button: 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700',
    },
    purple: {
      bg: 'bg-purple-500',
      bgLight: 'bg-purple-50 dark:bg-purple-900/20',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-500',
      button: 'bg-purple-500 hover:bg-purple-600 active:bg-purple-700',
    },
  };

  const colors = colorClasses[currentDose.color];

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
          {format(new Date(), 'd MMMM yyyy', { locale: ru })}
        </p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          День {currentDose.dayOfTherapy} терапии
        </h1>
      </div>

      {/* Phase Progress */}
      <div className={`${colors.bgLight} rounded-2xl p-6 mb-6`}>
        <div className="flex justify-between items-center mb-3">
          <span className={`text-sm font-medium ${colors.text}`}>
            {progress.phase}
          </span>
          {progress.total > 0 && (
            <span className={`text-sm ${colors.text}`}>
              {progress.current} / {progress.total}
            </span>
          )}
        </div>
        {progress.total > 0 && (
          <div className="w-full bg-white dark:bg-gray-700 rounded-full h-2">
            <div
              className={`${colors.bg} h-2 rounded-full transition-all duration-300`}
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        )}
      </div>

      {/* Dose Info Card */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-8 mb-6 text-center">
        <div className={`inline-flex items-center justify-center w-20 h-20 ${colors.bgLight} rounded-full mb-4`}>
          <Pill className={`w-10 h-10 ${colors.text}`} />
        </div>
        
        <h2 className="text-lg text-gray-600 dark:text-gray-400 mb-2">
          Сегодня нужно принять
        </h2>
        
        <div className="mb-4">
          <p className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
            {currentDose.clicks}
          </p>
          <p className={`text-xl font-medium ${colors.text}`}>
            {currentDose.clicks === 1 ? 'нажатие' : currentDose.clicks < 5 ? 'нажатия' : 'нажатий'}
          </p>
        </div>

        <div className={`inline-block px-4 py-2 ${colors.bgLight} rounded-full`}>
          <p className={`text-sm font-medium ${colors.text}`}>
            {currentDose.concentration}
          </p>
        </div>
      </div>

      {/* Already Taken Message */}
      {alreadyTaken && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-4 mb-6 flex items-center">
          <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mr-3 flex-shrink-0" />
          <div>
            <p className="font-medium text-green-900 dark:text-green-100">
              Препарат принят
            </p>
            {todayDose.notes && (
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                {todayDose.notes}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {!alreadyTaken && (
        <div className="space-y-3">
          {/* Notes Toggle */}
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="w-full flex items-center justify-center py-3 px-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl text-gray-700 dark:text-gray-300 font-medium touch-target transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            {showNotes ? 'Скрыть заметку' : 'Добавить заметку'}
          </button>

          {/* Notes Input */}
          {showNotes && (
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Например: принял в 9:00, после завтрака"
              className="w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              rows={3}
            />
          )}

          {/* Take Dose Button */}
          <button
            onClick={handleTakeDose}
            disabled={loading}
            className={`w-full ${colors.button} text-white font-semibold py-5 px-6 rounded-2xl touch-target transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg`}
          >
            <CheckCircle className="w-6 h-6 inline mr-2" />
            {loading ? 'Сохранение...' : 'Принял препарат'}
          </button>

          {/* Skip Dose Button */}
          <button
            onClick={handleSkipDose}
            disabled={loading}
            className="w-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium py-4 px-6 rounded-2xl touch-target transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <XCircle className="w-5 h-5 inline mr-2" />
            Пропустить приём
          </button>
        </div>
      )}

      {/* Phase Description */}
      <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>{getPhaseName(currentDose.phase)}</p>
        <p className="mt-1">
          {currentDose.phase === 'maintenance'
            ? 'Продолжайте принимать препарат в поддерживающей дозе'
            : 'Доза автоматически увеличивается каждый день'}
        </p>
      </div>
    </div>
  );
}

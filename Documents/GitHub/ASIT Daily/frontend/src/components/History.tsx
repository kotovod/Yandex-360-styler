import { useTherapy } from '@/contexts/TherapyContext';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale/ru';
import { CheckCircle, XCircle, MessageSquare, Pill } from 'lucide-react';

export default function History() {
  const { doses, sideEffects } = useTherapy();

  if (doses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <Pill className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-gray-500 text-center">
          История приёмов появится здесь
        </p>
      </div>
    );
  }

  const getSideEffectsForDose = (doseId: string) => {
    return sideEffects.filter((se) => se.doseId === doseId);
  };

  const severityLabels = {
    mild: 'Лёгкий',
    moderate: 'Средний',
    severe: 'Тяжёлый',
  };

  const typeLabels = {
    itching: 'Зуд',
    swelling: 'Отёк',
    redness: 'Покраснение',
    other: 'Другое',
  };

  return (
    <div className="p-6 pb-24">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        История приёмов
      </h2>

      <div className="space-y-4">
        {doses.map((dose) => {
          const doseSideEffects = getSideEffectsForDose(dose.id);
          const date = parseISO(dose.date);

          return (
            <div
              key={dose.id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow p-5"
            >
              {/* Date and Status */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {format(date, 'd MMMM yyyy', { locale: ru })}
                  </p>
                  {dose.timestamp && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {format(parseISO(dose.timestamp), 'HH:mm')}
                    </p>
                  )}
                </div>

                {dose.taken ? (
                  <div className="flex items-center text-green-600 dark:text-green-400">
                    <CheckCircle className="w-5 h-5 mr-1" />
                    <span className="text-sm font-medium">Принят</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600 dark:text-red-400">
                    <XCircle className="w-5 h-5 mr-1" />
                    <span className="text-sm font-medium">Пропущен</span>
                  </div>
                )}
              </div>

              {/* Dose Info */}
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                <Pill className="w-4 h-4 mr-2" />
                <span>
                  {dose.doseCount} {dose.doseCount === 1 ? 'нажатие' : dose.doseCount < 5 ? 'нажатия' : 'нажатий'} • {dose.concentration}
                </span>
              </div>

              {/* Notes */}
              {dose.notes && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 mt-3">
                  <div className="flex items-start">
                    <MessageSquare className="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {dose.notes}
                    </p>
                  </div>
                </div>
              )}

              {/* Side Effects */}
              {doseSideEffects.length > 0 && (
                <div className="mt-3 space-y-2">
                  {doseSideEffects.map((se) => (
                    <div
                      key={se.id}
                      className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-3"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
                          {typeLabels[se.type]}
                        </span>
                        <span className="text-xs text-orange-700 dark:text-orange-300">
                          {severityLabels[se.severity]}
                        </span>
                      </div>
                      {se.description && (
                        <p className="text-sm text-orange-800 dark:text-orange-200">
                          {se.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

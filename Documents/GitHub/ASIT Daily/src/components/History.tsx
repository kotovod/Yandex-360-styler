import { useState, useEffect } from 'react';
import { useTherapy } from '../contexts/TherapyContext';
import { DoseRecord } from '../types';
import { api } from '../services/api';
import { CheckCircle, XCircle, FileText } from 'lucide-react';

export default function History() {
  const { therapySession } = useTherapy();
  const [history, setHistory] = useState<DoseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const response = await api.getHistory(30);
      if (response.data) {
        setHistory(response.data as DoseRecord[]);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Функция для форматирования даты на русском
  const formatRussianDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Загрузка истории...</div>
      </div>
    );
  }

  if (!therapySession) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center text-gray-600 dark:text-gray-400">
          Терапия не начата
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <div className="max-w-md mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          История приёмов
        </h1>

        {history.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              История приёмов пока пуста
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((record) => {
              const dateStr = formatRussianDate(record.date);
              const colorClass = record.concentration?.includes('10')
                ? 'text-blue-concentration'
                : 'text-purple-concentration';

              return (
                <div
                  key={record.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {dateStr}
                      </p>
                      {record.concentration && (
                        <p className={`text-sm ${colorClass} font-medium`}>
                          {record.concentration}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {record.taken ? (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-500" />
                      )}
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {record.taken ? (
                      <span>Принято: <strong>{record.doseCount} нажатий</strong></span>
                    ) : (
                      <span>Пропущен</span>
                    )}
                  </div>

                  {record.notes && (
                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>Заметка:</strong> {record.notes}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

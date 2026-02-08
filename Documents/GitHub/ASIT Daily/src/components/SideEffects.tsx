import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

interface SideEffectsProps {
  doseRecordId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const SIDE_EFFECT_TYPES = [
  { value: 'itching', label: 'Зуд' },
  { value: 'swelling', label: 'Отёк' },
  { value: 'redness', label: 'Покраснение' },
  { value: 'other', label: 'Другое' },
];

const SEVERITY_LEVELS = [
  { value: 'mild', label: 'Лёгкий', color: 'text-yellow-600' },
  { value: 'moderate', label: 'Средний', color: 'text-orange-600' },
  { value: 'severe', label: 'Тяжёлый', color: 'text-red-600' },
];

export default function SideEffects({ doseRecordId, onClose, onSuccess }: SideEffectsProps) {
  const [type, setType] = useState('itching');
  const [severity, setSeverity] = useState('mild');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await api.addSideEffect(doseRecordId, type, severity, description);

      if (response.error) {
        setError(response.error);
      } else {
        onSuccess();
        onClose();
      }
    } catch (err) {
      setError('Ошибка сохранения');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Побочный эффект
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Тип реакции
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {SIDE_EFFECT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Severity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Степень тяжести
            </label>
            <div className="space-y-2">
              {SEVERITY_LEVELS.map((level) => (
                <label
                  key={level.value}
                  className={`flex items-center p-3 border rounded-xl cursor-pointer transition-colors ${
                    severity === level.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="severity"
                    value={level.value}
                    checked={severity === level.value}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="mr-3"
                  />
                  <span className={`font-medium ${level.color}`}>
                    {level.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Описание (необязательно)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Опишите симптомы подробнее..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl
                focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={4}
            />
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4 flex space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              При тяжёлых побочных эффектах немедленно обратитесь к врачу
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 
                rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 bg-blue-concentration text-white rounded-xl font-semibold
                transform transition-all duration-200 active:scale-95 touch-manipulation
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

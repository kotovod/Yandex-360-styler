import { useState } from 'react';
import { useTherapy } from '@/contexts/TherapyContext';
import { X, AlertTriangle } from 'lucide-react';
import type { SideEffect } from '@/types';

interface SideEffectsProps {
  onClose: () => void;
  doseId?: string;
}

export default function SideEffects({ onClose, doseId }: SideEffectsProps) {
  const { addSideEffect: addSideEffectToTherapy } = useTherapy();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<Omit<SideEffect, 'id'>>({
    doseId,
    date: new Date().toISOString(),
    type: 'itching',
    severity: 'mild',
    description: '',
  });

  const typeOptions = [
    { value: 'itching', label: 'Зуд' },
    { value: 'swelling', label: 'Отёк' },
    { value: 'redness', label: 'Покраснение' },
    { value: 'other', label: 'Другое' },
  ];

  const severityOptions = [
    { value: 'mild', label: 'Лёгкий', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'moderate', label: 'Средний', color: 'bg-orange-100 text-orange-800' },
    { value: 'severe', label: 'Тяжёлый', color: 'bg-red-100 text-red-800' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description.trim()) {
      alert('Пожалуйста, опишите побочный эффект');
      return;
    }

    setLoading(true);
    try {
      await addSideEffectToTherapy(formData);
      onClose();
    } catch (error) {
      console.error('Error adding side effect:', error);
      alert('Ошибка при добавлении побочного эффекта');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-gray-800 w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="w-6 h-6 text-orange-500 mr-2" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Побочный эффект
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Тип побочного эффекта
            </label>
            <div className="grid grid-cols-2 gap-3">
              {typeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: option.value as SideEffect['type'] })}
                  className={`py-3 px-4 rounded-xl font-medium transition-colors ${
                    formData.type === option.value
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Severity Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Степень тяжести
            </label>
            <div className="space-y-2">
              {severityOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, severity: option.value as SideEffect['severity'] })}
                  className={`w-full py-3 px-4 rounded-xl font-medium transition-all ${
                    formData.severity === option.value
                      ? 'ring-2 ring-offset-2 ring-blue-500 ' + option.color
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Описание
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Опишите симптомы подробнее..."
              className="w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              required
            />
          </div>

          {/* Warning */}
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
            <p className="text-sm text-orange-900 dark:text-orange-100">
              <strong>Важно:</strong> При тяжёлых побочных эффектах обратитесь к врачу.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

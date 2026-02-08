import { useState } from 'react';
import { useTherapy } from '@/contexts/TherapyContext';
import { Download, FileText } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale/ru';

export default function ExportData() {
  const { doses, sideEffects, therapy } = useTherapy();
  const [loading, setLoading] = useState(false);

  const generateTextReport = () => {
    if (!therapy) return '';

    const startDate = format(parseISO(therapy.startDate), 'd MMMM yyyy', { locale: ru });
    const takenDoses = doses.filter((d) => d.taken).length;
    const skippedDoses = doses.filter((d) => !d.taken).length;
    const adherence = doses.length > 0 ? ((takenDoses / doses.length) * 100).toFixed(1) : 0;

    let report = `ОТЧЁТ ПО АСИТ-ТЕРАПИИ\n`;
    report += `Препарат: Сталораль (аллерген пыльцы берёзы)\n`;
    report += `Дата начала: ${startDate}\n`;
    report += `Всего дней: ${doses.length}\n`;
    report += `Принято: ${takenDoses}\n`;
    report += `Пропущено: ${skippedDoses}\n`;
    report += `Приверженность: ${adherence}%\n\n`;

    report += `ИСТОРИЯ ПРИЁМОВ:\n`;
    report += `${'='.repeat(50)}\n\n`;

    doses.forEach((dose) => {
      const date = format(parseISO(dose.date), 'd MMMM yyyy', { locale: ru });
      const status = dose.taken ? '✓ Принят' : '✗ Пропущен';
      report += `${date}\n`;
      report += `Статус: ${status}\n`;
      report += `Доза: ${dose.doseCount} нажатий, ${dose.concentration}\n`;
      if (dose.notes) {
        report += `Заметка: ${dose.notes}\n`;
      }

      const doseSideEffects = sideEffects.filter((se) => se.doseId === dose.id);
      if (doseSideEffects.length > 0) {
        report += `Побочные эффекты:\n`;
        doseSideEffects.forEach((se) => {
          const typeLabels: Record<string, string> = {
            itching: 'Зуд',
            swelling: 'Отёк',
            redness: 'Покраснение',
            other: 'Другое',
          };
          const severityLabels: Record<string, string> = {
            mild: 'Лёгкий',
            moderate: 'Средний',
            severe: 'Тяжёлый',
          };
          report += `  - ${typeLabels[se.type]} (${severityLabels[se.severity]}): ${se.description}\n`;
        });
      }
      report += '\n';
    });

    return report;
  };

  const handleExportText = () => {
    const report = generateTextReport();
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `asit-report-${format(new Date(), 'yyyy-MM-dd')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const data = {
      therapy,
      doses,
      sideEffects,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `asit-data-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!therapy || doses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <FileText className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-gray-500 text-center">
          Нет данных для экспорта
        </p>
      </div>
    );
  }

  const takenDoses = doses.filter((d) => d.taken).length;
  const skippedDoses = doses.filter((d) => !d.taken).length;
  const adherence = doses.length > 0 ? ((takenDoses / doses.length) * 100).toFixed(1) : 0;

  return (
    <div className="p-6 pb-24">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
        <Download className="w-7 h-7 mr-2" />
        Экспорт данных
      </h2>

      {/* Statistics */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Статистика
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{doses.length}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Всего дней</p>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{takenDoses}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Принято</p>
          </div>
          
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">{skippedDoses}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Пропущено</p>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{adherence}%</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Приверженность</p>
          </div>
        </div>

        {sideEffects.length > 0 && (
          <div className="mt-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{sideEffects.length}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Побочных эффектов</p>
          </div>
        )}
      </div>

      {/* Export Buttons */}
      <div className="space-y-3">
        <button
          onClick={handleExportText}
          disabled={loading}
          className="w-full flex items-center justify-center py-4 px-6 bg-blue-500 text-white font-semibold rounded-2xl hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          <FileText className="w-5 h-5 mr-2" />
          Экспортировать как текст
        </button>

        <button
          onClick={handleExportJSON}
          disabled={loading}
          className="w-full flex items-center justify-center py-4 px-6 bg-gray-700 text-white font-semibold rounded-2xl hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          <Download className="w-5 h-5 mr-2" />
          Экспортировать как JSON
        </button>
      </div>

      {/* Info */}
      <div className="mt-6 bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <strong>Текстовый формат</strong> - удобен для отправки врачу и чтения.
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          <strong>JSON формат</strong> - содержит все данные для резервного копирования.
        </p>
      </div>
    </div>
  );
}

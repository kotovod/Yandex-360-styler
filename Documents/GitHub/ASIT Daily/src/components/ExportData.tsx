import { useState } from 'react';
import { Download, FileText, Loader } from 'lucide-react';
import jsPDF from 'jspdf';
import { storage } from '../services/storage';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function ExportData() {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState('');

  const handleExportPDF = async () => {
    setIsExporting(true);
    setError('');

    try {
      const token = storage.get<string>('auth_token');
      const response = await fetch(`${API_BASE_URL}/export/data`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Ошибка получения данных');
      }

      const data = await response.json();

      // Create PDF
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      let yPos = 20;

      // Title
      pdf.setFontSize(20);
      pdf.text('АСИТ Дейли - Отчёт', pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;

      // User info
      pdf.setFontSize(12);
      pdf.text(`Пациент: ${data.user.name}`, 20, yPos);
      yPos += 7;
      pdf.text(`Email: ${data.user.email}`, 20, yPos);
      yPos += 10;

      // Therapy info
      pdf.setFontSize(14);
      pdf.text('Информация о терапии', 20, yPos);
      yPos += 7;
      pdf.setFontSize(10);
      pdf.text(`Дата начала: ${new Date(data.therapy.startDate).toLocaleDateString('ru-RU')}`, 20, yPos);
      yPos += 5;
      pdf.text(`Поддерживающая доза: ${data.therapy.maintenanceDose} нажатий`, 20, yPos);
      yPos += 5;
      pdf.text(`Время напоминания: ${data.therapy.reminderTime}`, 20, yPos);
      yPos += 10;

      // Statistics
      pdf.setFontSize(14);
      pdf.text('Статистика', 20, yPos);
      yPos += 7;
      pdf.setFontSize(10);
      pdf.text(`Всего записей: ${data.statistics.totalDoses}`, 20, yPos);
      yPos += 5;
      pdf.text(`Принято доз: ${data.statistics.takenDoses}`, 20, yPos);
      yPos += 5;
      pdf.text(`Пропущено: ${data.statistics.skippedDoses}`, 20, yPos);
      yPos += 5;
      pdf.text(`Приверженность терапии: ${data.statistics.adherenceRate}%`, 20, yPos);
      yPos += 5;
      pdf.text(`Побочных эффектов: ${data.statistics.sideEffectsCount}`, 20, yPos);
      yPos += 10;

      // Doses history (last 10)
      pdf.setFontSize(14);
      pdf.text('История приёмов (последние 10)', 20, yPos);
      yPos += 7;
      pdf.setFontSize(9);

      data.doses.slice(0, 10).forEach((dose: any) => {
        if (yPos > 270) {
          pdf.addPage();
          yPos = 20;
        }

        const date = new Date(dose.date).toLocaleDateString('ru-RU');
        const status = dose.taken ? 'Принят' : 'Пропущен';
        const doseInfo = dose.taken ? `${dose.dose_count} нажатий (${dose.concentration})` : '-';
        
        pdf.text(`${date}: ${status} - ${doseInfo}`, 20, yPos);
        yPos += 5;

        if (dose.notes) {
          pdf.setFontSize(8);
          pdf.text(`  Заметка: ${dose.notes}`, 25, yPos);
          yPos += 4;
          pdf.setFontSize(9);
        }
      });

      // Side effects
      if (data.sideEffects.length > 0) {
        yPos += 5;
        if (yPos > 250) {
          pdf.addPage();
          yPos = 20;
        }

        pdf.setFontSize(14);
        pdf.text('Побочные эффекты', 20, yPos);
        yPos += 7;
        pdf.setFontSize(9);

        data.sideEffects.forEach((effect: any) => {
          if (yPos > 270) {
            pdf.addPage();
            yPos = 20;
          }

          const date = new Date(effect.date).toLocaleDateString('ru-RU');
          pdf.text(`${date}: ${effect.type} (${effect.severity})`, 20, yPos);
          yPos += 5;

          if (effect.description) {
            pdf.setFontSize(8);
            const lines = pdf.splitTextToSize(`  ${effect.description}`, pageWidth - 50);
            pdf.text(lines, 25, yPos);
            yPos += lines.length * 4;
            pdf.setFontSize(9);
          }
        });
      }

      // Footer
      yPos = pdf.internal.pageSize.getHeight() - 20;
      pdf.setFontSize(8);
      pdf.text(
        `Дата экспорта: ${new Date(data.exportDate).toLocaleString('ru-RU')}`,
        pageWidth / 2,
        yPos,
        { align: 'center' }
      );

      // Save PDF
      const filename = `asit-report-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);

    } catch (err) {
      console.error('Export error:', err);
      setError('Ошибка экспорта данных');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJSON = async () => {
    setIsExporting(true);
    setError('');

    try {
      const token = storage.get<string>('auth_token');
      const response = await fetch(`${API_BASE_URL}/export/data`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Ошибка получения данных');
      }

      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `asit-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error('Export error:', err);
      setError('Ошибка экспорта данных');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
      <div className="flex items-center space-x-3 mb-4">
        <FileText className="w-6 h-6 text-blue-concentration" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Экспорт данных
        </h2>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Экспортируйте историю приёмов и побочных эффектов для предоставления врачу
      </p>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm mb-4">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={handleExportPDF}
          disabled={isExporting}
          className="w-full py-3 px-4 bg-blue-concentration text-white rounded-xl font-semibold
            flex items-center justify-center space-x-2
            transform transition-all duration-200 active:scale-95 touch-manipulation
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              <span>Экспорт...</span>
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              <span>Экспорт в PDF</span>
            </>
          )}
        </button>

        <button
          onClick={handleExportJSON}
          disabled={isExporting}
          className="w-full py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 
            rounded-xl font-semibold flex items-center justify-center space-x-2
            hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors touch-manipulation
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-5 h-5" />
          <span>Экспорт в JSON</span>
        </button>
      </div>
    </div>
  );
}

import { useTherapy } from '@/contexts/TherapyContext';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth } from 'date-fns';
import { ru } from 'date-fns/locale/ru';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function Calendar() {
  const { doses, therapy } = useTherapy();
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  if (!therapy) {
    return (
      <div className="p-6">
        <p className="text-center text-gray-500 dark:text-gray-400">
          Начните терапию, чтобы увидеть календарь
        </p>
      </div>
    );
  }

  const getDoseForDay = (date: Date) => {
    return doses.find((dose) => {
      const doseDate = parseISO(dose.date);
      return isSameDay(doseDate, date);
    });
  };

  const therapyStartDate = parseISO(therapy.startDate);

  return (
    <div className="p-6">
      {/* Month Header */}
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
        {format(today, 'LLLL yyyy', { locale: ru })}
      </h2>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Empty cells for days before month starts */}
        {Array.from({ length: (monthStart.getDay() + 6) % 7 }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {/* Calendar Days */}
        {daysInMonth.map((date) => {
          const dose = getDoseForDay(date);
          const isToday = isSameDay(date, today);
          const isPast = date < today && !isToday;
          const isFuture = date > today;
          const beforeTherapy = date < therapyStartDate;

          let bgColor = 'bg-white dark:bg-gray-800';
          let textColor = 'text-gray-900 dark:text-white';
          let icon = null;

          if (beforeTherapy) {
            bgColor = 'bg-gray-50 dark:bg-gray-900';
            textColor = 'text-gray-400 dark:text-gray-600';
          } else if (dose) {
            if (dose.taken) {
              bgColor = 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500';
              textColor = 'text-green-900 dark:text-green-100';
              icon = <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 absolute top-1 right-1" />;
            } else {
              bgColor = 'bg-red-50 dark:bg-red-900/20 border-2 border-red-500';
              textColor = 'text-red-900 dark:text-red-100';
              icon = <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 absolute top-1 right-1" />;
            }
          } else if (isPast && !beforeTherapy) {
            bgColor = 'bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-500';
            textColor = 'text-yellow-900 dark:text-yellow-100';
            icon = <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 absolute top-1 right-1" />;
          }

          if (isToday) {
            bgColor += ' ring-2 ring-blue-500';
          }

          return (
            <div
              key={date.toISOString()}
              className={`aspect-square flex items-center justify-center rounded-lg relative ${bgColor} ${textColor} transition-colors`}
            >
              <span className="text-sm font-medium">{format(date, 'd')}</span>
              {icon}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 space-y-2">
        <div className="flex items-center">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
          <span className="text-sm text-gray-700 dark:text-gray-300">Принят</span>
        </div>
        <div className="flex items-center">
          <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
          <span className="text-sm text-gray-700 dark:text-gray-300">Пропущен</span>
        </div>
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
          <span className="text-sm text-gray-700 dark:text-gray-300">Нет данных</span>
        </div>
      </div>
    </div>
  );
}

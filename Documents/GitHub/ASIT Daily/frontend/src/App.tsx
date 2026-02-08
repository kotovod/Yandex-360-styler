import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { TherapyProvider } from '@/contexts/TherapyContext';
import Auth from '@/components/Auth';
import TodayDose from '@/components/TodayDose';
import Calendar from '@/components/Calendar';
import History from '@/components/History';
import Settings from '@/components/Settings';
import SideEffects from '@/components/SideEffects';
import ExportData from '@/components/ExportData';
import { Home, CalendarDays, FileText, Settings as SettingsIcon, Download, AlertTriangle } from 'lucide-react';

type Tab = 'today' | 'calendar' | 'history' | 'export' | 'settings';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('today');
  const [showSideEffects, setShowSideEffects] = useState(false);

  if (!isAuthenticated) {
    return <Auth />;
  }

  return (
    <TherapyProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 safe-top">
          <div className="px-6 py-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              АСИТ Дейли
            </h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="pb-20">
          {activeTab === 'today' && <TodayDose />}
          {activeTab === 'calendar' && <Calendar />}
          {activeTab === 'history' && <History />}
          {activeTab === 'export' && <ExportData />}
          {activeTab === 'settings' && <Settings />}
        </main>

        {/* Floating Action Button - Add Side Effect */}
        {activeTab === 'today' && (
          <button
            onClick={() => setShowSideEffects(true)}
            className="fixed right-6 bottom-24 w-14 h-14 bg-orange-500 text-white rounded-full shadow-lg hover:bg-orange-600 active:bg-orange-700 transition-colors flex items-center justify-center z-20"
            aria-label="Добавить побочный эффект"
          >
            <AlertTriangle className="w-6 h-6" />
          </button>
        )}

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 safe-bottom z-30">
          <div className="flex justify-around items-center px-2 py-2">
            <button
              onClick={() => setActiveTab('today')}
              className={`flex flex-col items-center py-2 px-4 rounded-xl transition-colors touch-target ${
                activeTab === 'today'
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <Home className="w-6 h-6" />
              <span className="text-xs mt-1">Главная</span>
            </button>

            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex flex-col items-center py-2 px-4 rounded-xl transition-colors touch-target ${
                activeTab === 'calendar'
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <CalendarDays className="w-6 h-6" />
              <span className="text-xs mt-1">Календарь</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex flex-col items-center py-2 px-4 rounded-xl transition-colors touch-target ${
                activeTab === 'history'
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <FileText className="w-6 h-6" />
              <span className="text-xs mt-1">История</span>
            </button>

            <button
              onClick={() => setActiveTab('export')}
              className={`flex flex-col items-center py-2 px-4 rounded-xl transition-colors touch-target ${
                activeTab === 'export'
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <Download className="w-6 h-6" />
              <span className="text-xs mt-1">Экспорт</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex flex-col items-center py-2 px-4 rounded-xl transition-colors touch-target ${
                activeTab === 'settings'
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <SettingsIcon className="w-6 h-6" />
              <span className="text-xs mt-1">Настройки</span>
            </button>
          </div>
        </nav>

        {/* Side Effects Modal */}
        {showSideEffects && (
          <SideEffects onClose={() => setShowSideEffects(false)} />
        )}
      </div>
    </TherapyProvider>
  );
}

function App() {
  return <AppContent />;
}

export default App;

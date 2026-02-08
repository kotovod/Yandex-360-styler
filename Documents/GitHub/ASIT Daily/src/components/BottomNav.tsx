import { NavLink } from 'react-router-dom';
import { Home, Calendar, Settings } from 'lucide-react';

export default function BottomNav() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center justify-center space-y-1 flex-1 py-3 transition-colors ${
      isActive
        ? 'text-blue-concentration'
        : 'text-gray-500 dark:text-gray-400'
    }`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50">
      <div className="max-w-md mx-auto flex">
        <NavLink to="/" className={linkClass}>
          <Home className="w-6 h-6" />
          <span className="text-xs font-medium">Главная</span>
        </NavLink>

        <NavLink to="/history" className={linkClass}>
          <Calendar className="w-6 h-6" />
          <span className="text-xs font-medium">История</span>
        </NavLink>

        <NavLink to="/settings" className={linkClass}>
          <Settings className="w-6 h-6" />
          <span className="text-xs font-medium">Настройки</span>
        </NavLink>
      </div>
    </nav>
  );
}

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TherapyProvider } from './contexts/TherapyContext';
import Auth from './components/Auth';
import TodayDose from './components/TodayDose';
import History from './components/History';
import Settings from './components/Settings';
import BottomNav from './components/BottomNav';

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth />;
  }

  return (
    <TherapyProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Routes>
            <Route path="/" element={<TodayDose />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
          <BottomNav />
        </div>
      </Router>
    </TherapyProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

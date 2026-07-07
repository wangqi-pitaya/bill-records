import { useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, BarChart3, User } from 'lucide-react';

export function TabBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const hidePaths = ['/categories', '/wallets'];
  if (hidePaths.includes(location.pathname)) return null;

  const handleNavigate = (path: string) => {
    if (location.pathname === path) return;
    navigate(path, { replace: true });
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-t border-gray-100 dark:border-gray-700 transition-colors duration-300">
      <div className="max-w-4xl mx-auto flex items-center h-14">
        <button
          onClick={() => handleNavigate('/')}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
            isActive('/')
              ? 'text-primary-600 dark:text-primary-400'
              : 'text-gray-400 dark:text-gray-500'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[11px] font-medium">记账</span>
        </button>
        <button
          onClick={() => handleNavigate('/statistics')}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
            isActive('/statistics')
              ? 'text-primary-600 dark:text-primary-400'
              : 'text-gray-400 dark:text-gray-500'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-[11px] font-medium">统计</span>
        </button>
        <button
          onClick={() => handleNavigate('/profile')}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
            isActive('/profile')
              ? 'text-primary-600 dark:text-primary-400'
              : 'text-gray-400 dark:text-gray-500'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[11px] font-medium">我的</span>
        </button>
      </div>
    </nav>
  );
}

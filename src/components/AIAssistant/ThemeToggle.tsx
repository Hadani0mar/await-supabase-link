
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Check system preference or localStorage on mount
  useEffect(() => {
    const isDark = localStorage.getItem('dark-mode') === 'true' || 
                  window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('dark-mode', String(newMode));
    
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <Button 
      variant="outline" 
      size="icon"
      className="rounded-full w-9 h-9 bg-white/50 backdrop-blur-sm border-gray-200 
                dark:bg-gray-800/50 dark:border-gray-700"
      onClick={toggleDarkMode}
    >
      {darkMode ? (
        <Sun className="h-4 w-4 text-yellow-500" />
      ) : (
        <Moon className="h-4 w-4 text-indigo-500" />
      )}
      <span className="sr-only">{darkMode ? 'Light mode' : 'Dark mode'}</span>
    </Button>
  );
};

export default ThemeToggle;

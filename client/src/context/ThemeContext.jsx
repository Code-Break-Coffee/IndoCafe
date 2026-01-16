import { useState, useEffect } from 'react';
import { brandConfig } from '../config/brandConfig';
import { ThemeContext } from './useTheme';

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    const root = document.documentElement;
    const colors = isDarkMode ? brandConfig.theme.dark : brandConfig.theme.light;

    // Inject CSS Variables
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--brand-${key}`, value);
    });

    // Inject UI Preferences
    root.style.setProperty('--border-radius', brandConfig.ui.borderRadius);
    root.style.setProperty('--font-family', brandConfig.ui.fontFamily);

    // Handle Tailwind Dark Mode Class
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  return <ThemeContext.Provider value={{ isDarkMode, toggleTheme, brandConfig }}>{children}</ThemeContext.Provider>;
};

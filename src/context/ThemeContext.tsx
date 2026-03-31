
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check local storage or system preference, default to 'dark' for this app
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('aiMultiToolHub_theme');
      if (storedTheme === 'light' || storedTheme === 'dark') {
        return storedTheme;
      }
      // Default to dark as per original design
      return 'dark'; 
    }
    return 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove both to ensure a clean switch
    root.classList.remove('light', 'dark');
    
    // Add current theme
    root.classList.add(theme);
    
    // Save to local storage
    localStorage.setItem('aiMultiToolHub_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

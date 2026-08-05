
import React, { createContext, useContext, useEffect, useMemo, useCallback, useState } from 'react';

type Theme = 'dark' | 'light';
export type UiMode = 'architect' | 'classic';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  uiMode: UiMode;
  toggleUiMode: () => void;
  setUiMode: (mode: UiMode) => void;
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
      return 'dark';
    }
    return 'dark';
  });

  const [uiMode, setUiModeState] = useState<UiMode>(() => {
    if (typeof window !== 'undefined') {
      const storedUiMode = localStorage.getItem('aiMultiToolHub_uiMode');
      if (storedUiMode === 'architect' || storedUiMode === 'classic') {
        return storedUiMode;
      }
      return 'architect'; // Default to new UI
    }
    return 'architect';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    try {
      localStorage.setItem('aiMultiToolHub_theme', theme);
    } catch (e) {
      console.warn('Failed to persist theme preference:', e);
    }
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('ui-architect', 'ui-classic');
    root.classList.add(`ui-${uiMode}`);
    try {
      localStorage.setItem('aiMultiToolHub_uiMode', uiMode);
    } catch (e) {
      console.warn('Failed to persist UI mode preference:', e);
    }
  }, [uiMode]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const toggleUiMode = useCallback(() => {
    setUiModeState((prev) => (prev === 'architect' ? 'classic' : 'architect'));
  }, []);

  const setUiMode = useCallback((mode: UiMode) => {
    setUiModeState(mode);
  }, []);

  const value = useMemo(
    () => ({ theme, toggleTheme, uiMode, toggleUiMode, setUiMode }),
    [theme, toggleTheme, uiMode, toggleUiMode, setUiMode]
  );

  return (
    <ThemeContext.Provider value={value}>
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

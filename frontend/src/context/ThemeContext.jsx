import React, { createContext, useContext, useState, useEffect } from 'react';

const THEMES = {
  aurora: {
    id: 'aurora',
    name: 'Aurora',
    accentPrimary: '#45E0D0',
    accentSecondary: '#8B7CFF',
    accentSoft: '#B8B4FF',
    bg: '#080B14',
    bgDeep: '#0C1120',
    surface: '#101522',
    card: '#151C2B',
    text: '#F4F7FB',
    muted: '#8993A7',
    border: 'rgba(69, 224, 208, 0.18)',
    success: '#57E6A5'
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight',
    accentPrimary: '#38BDF8',
    accentSecondary: '#818CF8',
    accentSoft: '#A5B4FC',
    bg: '#050811',
    bgDeep: '#090E1D',
    surface: '#0E1424',
    card: '#131A2F',
    text: '#F1F5F9',
    muted: '#64748B',
    border: 'rgba(56, 189, 248, 0.18)',
    success: '#34D399'
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    accentPrimary: '#06B6D4',
    accentSecondary: '#3B82F6',
    accentSoft: '#93C5FD',
    bg: '#041017',
    bgDeep: '#071822',
    surface: '#0A212E',
    card: '#0F2C3D',
    text: '#F0F9FF',
    muted: '#64748B',
    border: 'rgba(6, 182, 212, 0.18)',
    success: '#2DD4BF'
  },
  violet: {
    id: 'violet',
    name: 'Violet',
    accentPrimary: '#A855F7',
    accentSecondary: '#EC4899',
    accentSoft: '#F472B6',
    bg: '#0A0617',
    bgDeep: '#120B26',
    surface: '#170E33',
    card: '#22154A',
    text: '#FAF5FF',
    muted: '#94A3B8',
    border: 'rgba(168, 85, 247, 0.22)',
    success: '#4ADE80'
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald',
    accentPrimary: '#10B981',
    accentSecondary: '#34D399',
    accentSoft: '#6EE7B7',
    bg: '#05120B',
    bgDeep: '#091C12',
    surface: '#0D2517',
    card: '#133522',
    text: '#ECFDF5',
    muted: '#64748B',
    border: 'rgba(16, 185, 129, 0.2)',
    success: '#10B981'
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset',
    accentPrimary: '#F97316',
    accentSecondary: '#FB7185',
    accentSoft: '#FDA4AF',
    bg: '#12080B',
    bgDeep: '#1C0D12',
    surface: '#251117',
    card: '#351821',
    text: '#FFF1F2',
    muted: '#94A3B8',
    border: 'rgba(249, 115, 22, 0.22)',
    success: '#34D399'
  }
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem('echoes_theme') || 'aurora';
    } catch {
      return 'aurora';
    }
  });

  const [settings, setSettingsState] = useState(() => {
    try {
      const saved = localStorage.getItem('echoes_settings');
      return saved ? JSON.parse(saved) : {
        fontSize: 'normal', // 'normal' | 'large'
        animations: true,
        narrationSpeed: 0.95,
        subtitles: true
      };
    } catch {
      return {
        fontSize: 'normal',
        animations: true,
        narrationSpeed: 0.95,
        subtitles: true
      };
    }
  });

  const setTheme = (themeKey) => {
    const cleanKey = String(themeKey).toLowerCase().trim();
    if (THEMES[cleanKey]) {
      setThemeState(cleanKey);
      try {
        localStorage.setItem('echoes_theme', cleanKey);
      } catch (e) {}
    }
  };

  const updateSettings = (partialSettings) => {
    setSettingsState((prev) => {
      const updated = { ...prev, ...partialSettings };
      try {
        localStorage.setItem('echoes_settings', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-fontsize', settings.fontSize || 'normal');
    document.documentElement.setAttribute('data-animations', settings.animations ? 'enabled' : 'disabled');
  }, [settings.fontSize, settings.animations]);

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      themes: THEMES,
      settings,
      updateSettings
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

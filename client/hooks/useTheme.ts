import { storage } from '@/services/storage';
import { THEME_STORAGE_KEY } from '@/utility/constants';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

export const useTheme = () => {
  const systemColorScheme = useColorScheme(); // 'light' or 'dark'
  const [themeMode, setThemeMode] = useState('auto'); // 'light' | 'dark' | 'system'
  const [isStorageLoaded, setIsStorageLoaded] = useState(false);

  // Load saved preference on mount
  useEffect(() => {
    const loadFromStorage = async () => {
      try {
        const savedTheme = await storage.get(THEME_STORAGE_KEY);
        if (savedTheme) setThemeMode(savedTheme);
      } catch (e) {
        console.error("Failed to load themes from storage", e);
      } finally {
        setIsStorageLoaded(true);
      }
    }

    loadFromStorage();
  }, []);

  //Save Preferences
  useEffect(() => {
    if (!isStorageLoaded) return;

    const saveToStorage = async () => {
      try {
        await storage.save(THEME_STORAGE_KEY, themeMode);
      } catch (e) {
        console.error("Failed to save theme")
      }
    }

    saveToStorage();
  }, [themeMode])

  // Determine the actual active theme
  const isDark = themeMode === 'auto' 
    ? systemColorScheme === 'dark' 
    : themeMode === 'dark';

  return {
    themeMode, 
    isDark,   
    setThemeMode
  };
};
import { storage } from '@/services/storage';
import { VISIBLE_SETTINGS_KEY } from '@/utility/constants';
import { useEffect, useState } from 'react';

export const useVisibleSettings = () => {
  const [visibleSettings, setVisibleSettings] = useState<Set<string>>(new Set());
  const [isStorageLoaded, setIsStorageLoaded] = useState(false);

  // Load from storage
  useEffect(() => {
    const loadFromStorage = async () => {
      try {
        const savedVisibleSettings = await storage.get(VISIBLE_SETTINGS_KEY);

        if (savedVisibleSettings) {
          setVisibleSettings(new Set(savedVisibleSettings));
        }
      } catch (error) {
        console.error('Failed to load visible settings from storage:', error);
      } finally {
        setIsStorageLoaded(true);
      }
    };

    loadFromStorage();
  }, []);

  // Save to storage
  useEffect(() => {
    if (!isStorageLoaded) return;

    const saveToStorage = async () => {
      try {
        await storage.save(VISIBLE_SETTINGS_KEY, Array.from(visibleSettings));
      } catch (error) {
        console.error('Failed to save visible settings to storage:', error);
      }
    };

    saveToStorage();
  }, [visibleSettings, isStorageLoaded]);

  return {
    visibleSettings,
    setVisibleSettings,
    isStorageLoaded,
  };
};

import { storage } from '@/services/storage';
import { LOGGED_IN_KEY } from '@/utility/constants';
import { useEffect, useState } from 'react';

export const useValidJwt = () => {
  const [validJwt, setValidJwt] = useState<boolean>(false);
  const [isStorageLoaded, setIsStorageLoaded] = useState<boolean>(false);
  console.log(validJwt);

  // ─── Load From Storage ───────────────────────────────────────────────────

  useEffect(() => {
    const loadFromStorage = async () => {
      try {
        const savedLoad = await storage.get(LOGGED_IN_KEY);
        console.log('savedLoad', savedLoad);
        if (savedLoad) {
          setValidJwt(savedLoad);
        }
      } catch (error) {
        console.error('Failed to load "logged in" data from storage:', error);
      } finally {
        setIsStorageLoaded(true);
      }
    };

    loadFromStorage();
  }, []);

  // ─── Save To Storage ─────────────────────────────────────────────────────

  useEffect(() => {
    if (!isStorageLoaded) return;

    const saveToStorage = async () => {
      try {
        await storage.save(LOGGED_IN_KEY, validJwt);
      } catch (error) {
        console.error('Failed to save "logged in" data to storage:', error);
      }
    };

    saveToStorage();
  }, [validJwt, isStorageLoaded]);

  return {
    validJwt,
    setValidJwt,
    isStorageLoaded,
  };
};

import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  saveSecure: async (key: string, value: any) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error("Failed storage.NATIVE.ts:saveSecure", e);
    }
  },

  getSecure: async (key: string) => {
    try {
      const val = await AsyncStorage.getItem(key);
      return val ? JSON.parse(val) : null;
    } catch (error) {
      console.error(`Failed storage.NATIVE.ts:getSecure for "${key}":`, error);
      return null;
    }
  },

  removeSecure: async (key: string) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.error("Failed storage.NATIVE.ts:removeSecure", e);
    }
  },

  save: async (key: string, value: any) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error("Failed storage.NATIVE.ts:save", e);
    }
  },

  get: async (key: string) => {
    try {
      const val = await AsyncStorage.getItem(key);
      return val ? JSON.parse(val) : null;
    } catch (error) {
      console.error(`Failed storage.NATIVE.ts:get for "${key}":`, error);
      return null;
    }
  },
  
  remove: async (key: string) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.error("Failed storage.NATIVE.ts:remove", e);
    }
  },

  clearAll: async () => {
    try {
      await AsyncStorage.clear();
    } catch (e) {
      console.error("Failed storage.NATIVE.ts:clearAll", e);
    }
  }
};
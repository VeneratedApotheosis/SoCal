import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform, useWindowDimensions } from 'react-native';

export interface ScreenSizeContextType {
  width: number;
  height: number;
  isLandscape: boolean;
  isWeb: number;
  fixedSidebar: number;
}

const ScreenSizeContext = createContext<ScreenSizeContextType | undefined>(undefined);

export const ScreenSizeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { width, height } = useWindowDimensions();
  const isWeb: number = Number(Platform.OS === 'web' && width >= 600);
  const fixedSidebar: number = Number(isWeb && width >= 1200);

  const [dimensions, setDimensions] = useState({
    width: width,
    height: height,
    isLandscape: width > height,
    isWeb: Number(Platform.OS === 'web' && width >= 600),
    fixedSidebar: Number(isWeb && width >= 1200),
  });

  useEffect(() => {
    // Debounce the update: Clear previous timer if width/height changes mid-adjust
    const handler = setTimeout(() => {
      setDimensions({
        width: width,
        height: height,
        isLandscape: width > height,
        isWeb: Number(Platform.OS === 'web' && width >= 600),
        fixedSidebar: Number(isWeb && width >= 1200),
      });
    }, 150);

    return () => {
      clearTimeout(handler);
    };
  }, [width, height, isWeb, fixedSidebar]);

  return <ScreenSizeContext.Provider value={dimensions}>{children}</ScreenSizeContext.Provider>;
};

export const useScreenSize = () => {
  const context = useContext(ScreenSizeContext);
  if (!context) {
    throw new Error('useScreenSize must be used within a ScreenSizeProvider');
  }
  return context;
};

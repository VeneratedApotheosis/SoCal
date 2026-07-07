import React, { createContext, useContext, useEffect, useState } from 'react';
import { useWindowDimensions } from 'react-native';

export interface ScreenSizeContextType {
  width: number;
  height: number;
  isLandscape: boolean;
}

const ScreenSizeContext = createContext<ScreenSizeContextType | undefined>(undefined);

export const ScreenSizeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const [dimensions, setDimensions] = useState({
    width: windowWidth,
    height: windowHeight,
    isLandscape: windowWidth > windowHeight,
  });

  useEffect(() => {
    // Debounce the update: Clear previous timer if width/height changes mid-adjust
    const handler = setTimeout(() => {
      setDimensions({
        width: windowWidth,
        height: windowHeight,
        isLandscape: windowWidth > windowHeight,
      });
    }, 150);

    return () => {
      clearTimeout(handler);
    };
  }, [windowWidth, windowHeight]);

  return <ScreenSizeContext.Provider value={dimensions}>{children}</ScreenSizeContext.Provider>;
};

export const useScreenSize = () => {
  const context = useContext(ScreenSizeContext);
  if (!context) {
    throw new Error('useScreenSize must be used within a ScreenSizeProvider');
  }
  return context;
};

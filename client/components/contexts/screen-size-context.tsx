import React, { createContext, useContext, useMemo } from 'react';
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

  // useMemo ensures context consumers only re-render if width or height actually changes
  const contextValue = useMemo(() => {
    const isWebBool = Platform.OS === 'web' && width >= 600;
    const fixedSidebarBool = isWebBool && width >= 1200;

    return {
      width,
      height,
      isLandscape: width > height,
      isWeb: Number(isWebBool),
      fixedSidebar: Number(fixedSidebarBool),
    };
  }, [width, height]);

  return <ScreenSizeContext.Provider value={contextValue}>{children}</ScreenSizeContext.Provider>;
};

export const useScreenSize = () => {
  const context = useContext(ScreenSizeContext);
  if (!context) {
    throw new Error('useScreenSize must be used within a ScreenSizeProvider');
  }
  return context;
};

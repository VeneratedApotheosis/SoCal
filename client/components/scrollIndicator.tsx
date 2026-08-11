import { COLORS } from '@/utility/theme';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useUIContext } from './contexts/ui-context';

export function useWebScrollbarStyle() {
  const { theme } = useUIContext();

  useEffect(() => {
    // Escape hatch: Only run this on the web
    if (Platform.OS !== 'web') return;
    // const headerBgColor = theme.isDark ? COLORS.background.mutedDark : COLORS.background.light;

    // // 1. Ensure viewport has `viewport-fit=cover`
    // let viewportMeta = document.querySelector('meta[name="viewport"]');
    // if (viewportMeta) {
    //   let content = viewportMeta.getAttribute('content') || '';
    //   if (!content.includes('viewport-fit=cover')) {
    //     viewportMeta.setAttribute('content', `${content}, viewport-fit=cover`);
    //   }
    // }

    // // 2. Set theme-color for Safari UI
    // let themeMeta = document.querySelector('meta[name="theme-color"]');
    // if (!themeMeta) {
    //   themeMeta = document.createElement('meta');
    //   themeMeta.name = 'theme-color';
    //   document.head.appendChild(themeMeta);
    // }
    // themeMeta.content = headerBgColor;

    // // 3. Allow app canvas to extend under iOS status bar
    // let appleMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    // if (!appleMeta) {
    //   appleMeta = document.createElement('meta');
    //   appleMeta.name = 'apple-mobile-web-app-status-bar-style';
    //   document.head.appendChild(appleMeta);
    // }
    // appleMeta.content = 'black-translucent';

    // 1. Pick colors based on current mode
    const trackColor = 'transparent';
    const thumbColor = theme.isDark ? COLORS.text.subtleDark : COLORS.text.subtleLight;
    const backgroundColor = theme.isDark ? COLORS.background.mutedDark : COLORS.background.mutedLight;

    // 2. Write the CSS string
    const css = `
      /* 2. Prevent Safari rubber-banding */
      html, body, #root {
        height: 100% !important;
        width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
        overscroll-behavior: none !important;
        touch-action: pan-x pan-y !important;
      }
      /* 1. Overall thickness */
      ::-webkit-scrollbar {
        width: 14px; 
        height: 14px;
      }

      /* 2. Background Color (Track) */
      ::-webkit-scrollbar-track {
        background: ${trackColor};
        border-radius: 8px; /* Optional: rounds the track ends */
      }

      /* 3. Bar Color (Thumb) */
      ::-webkit-scrollbar-thumb {
        background-color: ${thumbColor};
        border-radius: 8px;
        /* Pro-tip: Add a border matching the track color to create built-in padding! */
        border: 3px solid ${trackColor}; 
      }
      
      /* Hover state for the bar */
      ::-webkit-scrollbar-thumb:hover {
        background-color: ${theme.isDark ? COLORS.text.lightGray : COLORS.text.darkGray};
      }

      /* 4. The Arrows (Buttons) */

      /* Optional: Hide arrows entirely if you want it purely minimalist */
      
      ::-webkit-scrollbar-button {
        display: none !important; 
        width: 0px;
        height: 0px;
      } 
      

      /* 
        FIREFOX FALLBACK 
        Firefox does not use webkit prefixes. It uses standardized CSS properties, 
        which only allow setting the thumb/track color and a thin/auto width. 
        It does not support custom arrows.
      */
      html {
        scrollbar-width: auto;
        scrollbar-color: ${thumbColor} ${trackColor};
        background-color: ${backgroundColor};
      }
    `;

    // 3. Create the <style> element and append it to the document head
    const styleElement = document.createElement('style');
    styleElement.id = 'custom-web-scrollbar';
    styleElement.appendChild(document.createTextNode(css));

    // Remove any existing scrollbar styles to prevent duplicates when toggling dark mode
    const existingStyle = document.getElementById('custom-web-scrollbar');
    if (existingStyle) {
      document.head.removeChild(existingStyle);
    }

    document.head.appendChild(styleElement);

    // Cleanup when component unmounts
    return () => {
      const styleToRemove = document.getElementById('custom-web-scrollbar');
      if (styleToRemove) {
        document.head.removeChild(styleToRemove);
      }
    };
  }, [theme.isDark]); // Re-run if dark mode toggles
}

import { useEffect, useState } from 'react';

/**
 * Hook to get theme-aware image paths
 * Returns appropriate image based on current light/dark theme
 */
export function useThemeImage() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial theme
    const htmlElement = window.document.documentElement;
    setIsDark(htmlElement.classList.contains('dark'));

    // Watch for theme changes
    const observer = new MutationObserver(() => {
      setIsDark(htmlElement.classList.contains('dark'));
    });

    observer.observe(htmlElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  const getImage = (lightPath: string, darkPath: string) => {
    return isDark ? darkPath : lightPath;
  };

  return {
    isDark,
    getImage,
    plateLight: '/Fork_Tableware_White_Plate_PNG-removebg-preview.png',
    plateDark: '/Download_bord__vork_en_mes_icoon_gratis-removebg-preview.png',
    plateIcon: isDark 
      ? '/Download_bord__vork_en_mes_icoon_gratis-removebg-preview.png'
      : '/Fork_Tableware_White_Plate_PNG-removebg-preview.png',
  };
}

import { useThemeImage } from '@/hooks/useThemeImage';

interface ThemeAwareImageProps {
  lightSrc: string;
  darkSrc: string;
  alt: string;
  className?: string;
  [key: string]: any;
}

/**
 * Image component that automatically switches between light and dark versions
 * based on the current theme
 */
export function ThemeAwareImage({
  lightSrc,
  darkSrc,
  alt,
  className = '',
  ...props
}: ThemeAwareImageProps) {
  const { isDark } = useThemeImage();

  return (
    <img
      src={isDark ? darkSrc : lightSrc}
      alt={alt}
      className={className}
      {...props}
    />
  );
}

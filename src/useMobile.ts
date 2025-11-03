// src/hooks/useMobile.ts
import { useState, useEffect } from "react";

export const useMobile = (breakpoint: number = 768) => {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [windowSize, setWindowSize] = useState<{
    width: number;
    height: number;
  }>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setWindowSize({ width, height });
      setIsMobile(width < breakpoint);
    };

    // Verificar inicialmente
    handleResize();

    // Adicionar listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);

  return {
    isMobile,
    windowSize,
    isPortrait: windowSize.height > windowSize.width,
    isLandscape: windowSize.width > windowSize.height,
    breakpoint,
  };
};

// Hook para detectar touch device
export const useTouchDevice = (): boolean => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouchDevice = () => {
      setIsTouchDevice(
        "ontouchstart" in window ||
          navigator.maxTouchPoints > 0 ||
          (navigator as any).msMaxTouchPoints > 0
      );
    };

    checkTouchDevice();
  }, []);

  return isTouchDevice;
};

import { useState, useEffect } from 'react';

export default function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    isMobile: window.innerWidth <= 768,
    isTablet: window.innerWidth <= 1024 && window.innerWidth > 768,
  });

  useEffect(() => {
    const handler = () => {
      const w = window.innerWidth;
      setSize({ width: w, isMobile: w <= 768, isTablet: w <= 1024 && w > 768 });
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return size;
}
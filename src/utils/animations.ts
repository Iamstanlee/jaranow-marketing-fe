// Utility functions for performance-optimized animations

export const getReducedMotionPreference = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Optimized animation variants that respect reduced motion preferences
export const fadeInVariants = {
  hidden: { opacity: 0, y: getReducedMotionPreference() ? 0 : 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: getReducedMotionPreference() ? 0.01 : 0.6,
      ease: "easeOut"
    }
  }
};

export const slideInVariants = {
  hidden: { opacity: 0, x: getReducedMotionPreference() ? 0 : -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: getReducedMotionPreference() ? 0.01 : 0.5,
      ease: "easeOut"
    }
  }
};

export const scaleVariants = {
  initial: { scale: getReducedMotionPreference() ? 1 : 0.95 },
  animate: {
    scale: 1,
    transition: {
      duration: getReducedMotionPreference() ? 0.01 : 0.3,
      ease: "easeOut"
    }
  }
};

// Debounced scroll handler for performance
export const throttle = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  let lastExecTime = 0;

  return (...args: any[]) => {
    const currentTime = Date.now();

    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
};
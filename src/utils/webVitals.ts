import { getCLS, getFID, getFCP, getLCP, getTTFB, Metric } from 'web-vitals';

// Custom web vitals reporting function
const sendToAnalytics = (metric: Metric) => {
  // Send to Google Analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', metric.name, {
      custom_parameter_1: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      custom_parameter_2: metric.id,
    });
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`${metric.name}: ${metric.value}`, metric);
  }
};

// Initialize web vitals measurement
export const initWebVitals = () => {
  getCLS(sendToAnalytics);
  getFID(sendToAnalytics);
  getFCP(sendToAnalytics);
  getLCP(sendToAnalytics);
  getTTFB(sendToAnalytics);
};

// Optimize Largest Contentful Paint (LCP)
export const optimizeLCP = () => {
  // Preload critical resources
  const criticalImages = ['/logo-brand.png', '/logo-wash.png'];

  criticalImages.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });
};

// Optimize First Input Delay (FID)
export const optimizeFID = () => {
  // Use requestIdleCallback for non-critical tasks
  const scheduleTask = (task: () => void) => {
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(task);
    } else {
      setTimeout(task, 1);
    }
  };

  return scheduleTask;
};

// Optimize Cumulative Layout Shift (CLS)
export const preventLayoutShift = () => {
  // Add CSS to prevent layout shifts
  const style = document.createElement('style');
  style.textContent = `
    img, video, iframe {
      max-width: 100%;
      height: auto;
    }

    /* Reserve space for images */
    .aspect-ratio-container {
      position: relative;
      width: 100%;
    }

    .aspect-ratio-container::before {
      content: '';
      display: block;
      padding-bottom: var(--aspect-ratio, 56.25%);
    }

    .aspect-ratio-container > * {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    /* Optimize font loading */
    @font-face {
      font-family: 'System';
      src: local('system-ui'), local('-apple-system'), local('BlinkMacSystemFont'), local('Segoe UI'), local('Roboto');
      font-display: swap;
    }
  `;
  document.head.appendChild(style);
};

// Initialize all Core Web Vitals optimizations
export const initCoreWebVitals = () => {
  if (typeof window !== 'undefined') {
    initWebVitals();
    optimizeLCP();
    preventLayoutShift();

    // Schedule non-critical optimizations
    const scheduleTask = optimizeFID();
    scheduleTask(() => {
      // Additional non-critical optimizations can go here
    });
  }
};
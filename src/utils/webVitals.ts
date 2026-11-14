import { getCLS, getFID, getFCP, getLCP, getTTFB, Metric } from 'web-vitals';

const sendToAnalytics = (metric: Metric) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', metric.name, {
      custom_parameter_1: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      custom_parameter_2: metric.id,
    });
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(`${metric.name}: ${metric.value}`, metric);
  }
};

export const initWebVitals = () => {
  getCLS(sendToAnalytics);
  getFID(sendToAnalytics);
  getFCP(sendToAnalytics);
  getLCP(sendToAnalytics);
  getTTFB(sendToAnalytics);
};

export const optimizeLCP = () => {
  const criticalImages = ['/brand/jaranow-logo-white.svg'];

  criticalImages.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });
};

export const optimizeFID = () => {
  const scheduleTask = (task: () => void) => {
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(task);
    } else {
      setTimeout(task, 1);
    }
  };

  return scheduleTask;
};

export const preventLayoutShift = () => {
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

export const initCoreWebVitals = () => {
  if (typeof window !== 'undefined') {
    initWebVitals();
    optimizeLCP();
    preventLayoutShift();

    const scheduleTask = optimizeFID();
    scheduleTask(() => {
    });
  }
};
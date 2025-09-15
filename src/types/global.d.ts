declare global {
  interface Window {
    Sentry?: any;
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
  
  // Build-time constants
  const __APP_VERSION__: string;
  const __BUILD_DATE__: string;
  const __COMMIT_SHA__: string;
}

export {};
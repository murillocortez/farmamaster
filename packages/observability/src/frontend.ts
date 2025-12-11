import { onCLS, onFID, onLCP } from 'web-vitals';

export const reportWebVitals = (sendToAnalytics?: (metric: any) => void) => {
    onCLS(sendToAnalytics || console.log);
    onFID(sendToAnalytics || console.log);
    onLCP(sendToAnalytics || console.log);
};

export const initSentry = (dsn: string) => {
    console.log(`[Observability] Initializing Sentry for DSN: ${dsn}`);
    // In a real scenario: Sentry.init({ dsn });
};

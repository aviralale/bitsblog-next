"use client";

import { useReportWebVitals } from "next/web-vitals";

/**
 * Web Vitals Tracking Component
 * 
 * Monitors Core Web Vitals for SEO performance:
 * - CLS (Cumulative Layout Shift): < 0.1 good
 * - FID (First Input Delay): < 100ms good  
 * - FCP (First Contentful Paint): < 1.8s good
 * - LCP (Largest Contentful Paint): < 2.5s good
 * - TTFB (Time to First Byte): < 600ms good
 * - INP (Interaction to Next Paint): < 200ms good
 */
export function WebVitals() {
  useReportWebVitals((metric) => {
    // Send to analytics service (Google Analytics, Vercel Analytics, etc.)
    if (process.env.NODE_ENV === "production") {
      const body = JSON.stringify(metric);
      const url = "/api/analytics/web-vitals";

      // Use `navigator.sendBeacon()` if available, falling back to `fetch()`
      if (navigator.sendBeacon) {
        navigator.sendBeacon(url, body);
      } else {
        fetch(url, { body, method: "POST", keepalive: true }).catch(
          console.error
        );
      }
    }

    // Log in development for debugging
    if (process.env.NODE_ENV === "development") {
      console.log(`[Web Vitals] ${metric.name}:`, {
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
      });
    }
  });

  return null;
}

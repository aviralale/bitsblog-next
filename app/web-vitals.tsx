"use client";

import { useReportWebVitals } from "next/web-vitals";

export function WebVitals() {
  useReportWebVitals((metric) => {
    if (process.env.NODE_ENV === "production") {
      // Optional sampling
      // if (metric.rating === "good") return;

      const payload = {
        id: metric.id,
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        navigationType: metric.navigationType,
      };

      const body = JSON.stringify(payload);
      const url = "/api/analytics/web-vitals";

      if (navigator.sendBeacon) {
        navigator.sendBeacon(url, body);
      } else {
        fetch(url, {
          method: "POST",
          body,
          keepalive: true,
          headers: { "Content-Type": "application/json" },
        }).catch(() => {});
      }
    }

    if (process.env.NODE_ENV === "development") {
      console.log(`[Web Vitals] ${metric.name}`, {
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
      });
    }
  });

  return null;
}

"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

declare global {
  interface Window {
    gtag: (
      command: string,
      action: string,
      params?: Record<string, unknown>
    ) => void;
  }
}

export function AdvancedAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window.gtag !== "undefined") {
      // Track page views
      window.gtag("event", "page_view", {
        page_path: pathname,
        page_search: searchParams.toString(),
        page_title: document.title,
      });
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    // Track scroll depth for SEO engagement metrics
    let maxScroll = 0;
    const scrollThresholds = [25, 50, 75, 90, 100];
    const trackedThresholds = new Set<number>();

    const trackScrollDepth = () => {
      const scrollPercent = Math.round(
        ((window.scrollY + window.innerHeight) /
          document.documentElement.scrollHeight) *
          100
      );

      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
      }

      scrollThresholds.forEach((threshold) => {
        if (
          scrollPercent >= threshold &&
          !trackedThresholds.has(threshold)
        ) {
          trackedThresholds.add(threshold);
          if (typeof window.gtag !== "undefined") {
            window.gtag("event", "scroll_depth", {
              event_category: "engagement",
              event_label: `${threshold}%`,
              value: threshold,
              page_path: pathname,
            });
          }
        }
      });
    };

    window.addEventListener("scroll", trackScrollDepth, { passive: true });
    return () => window.removeEventListener("scroll", trackScrollDepth);
  }, [pathname]);

  useEffect(() => {
    // Track time on page (SEO engagement signal)
    const startTime = Date.now();
    const intervals = [30, 60, 120, 300]; // 30s, 1m, 2m, 5m
    const tracked = new Set<number>();

    const trackTimeOnPage = setInterval(() => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);

      intervals.forEach((interval) => {
        if (timeSpent >= interval && !tracked.has(interval)) {
          tracked.add(interval);
          if (typeof window.gtag !== "undefined") {
            window.gtag("event", "time_on_page", {
              event_category: "engagement",
              event_label: `${interval}s`,
              value: interval,
              page_path: pathname,
            });
          }
        }
      });
    }, 1000);

    return () => clearInterval(trackTimeOnPage);
  }, [pathname]);

  useEffect(() => {
    // Track outbound links
    const trackOutboundLink = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (href && href.startsWith("http") && !href.includes(window.location.hostname)) {
        if (typeof window.gtag !== "undefined") {
          window.gtag("event", "click", {
            event_category: "outbound_link",
            event_label: href,
            page_path: pathname,
          });
        }
      }
    };

    document.addEventListener("click", trackOutboundLink);
    return () => document.removeEventListener("click", trackOutboundLink);
  }, [pathname]);

  useEffect(() => {
    // Track search interactions
    const trackSearch = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.type === "search" || target.name === "q") {
        const searchTerm = target.value;
        if (searchTerm.length > 2) {
          if (typeof window.gtag !== "undefined") {
            window.gtag("event", "search", {
              search_term: searchTerm,
              page_path: pathname,
            });
          }
        }
      }
    };

    document.addEventListener("input", trackSearch);
    return () => document.removeEventListener("input", trackSearch);
  }, [pathname]);

  return null;
}

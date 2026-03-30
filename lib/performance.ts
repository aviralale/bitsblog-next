/**
 * Lazy Loading Utilities for Performance Optimization
 * 
 * These utilities help defer loading of non-critical resources
 * to improve Core Web Vitals (LCP, CLS, FID)
 */

import React from "react";

/**
 * IntersectionObserver-based lazy loading for images
 * Usage: <img data-src="image.jpg" class="lazy" alt="..." />
 */
export function initLazyImages() {
  if (typeof window === "undefined") return;

  const lazyImages = document.querySelectorAll("img.lazy");

  if ("IntersectionObserver" in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.getAttribute("data-src");
          const srcset = img.getAttribute("data-srcset");

          if (src) {
            img.src = src;
            img.removeAttribute("data-src");
          }

          if (srcset) {
            img.srcset = srcset;
            img.removeAttribute("data-srcset");
          }

          img.classList.remove("lazy");
          imageObserver.unobserve(img);
        }
      });
    });

    lazyImages.forEach((img) => imageObserver.observe(img));
  } else {
    // Fallback for browsers without IntersectionObserver
    lazyImages.forEach((img) => {
      const element = img as HTMLImageElement;
      const src = element.getAttribute("data-src");
      if (src) element.src = src;
    });
  }
}

/**
 * Lazy load components when they become visible
 * Usage: const LazyComponent = lazyLoadComponent(() => import('./Component'))
 */
export function lazyLoadComponent<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) {
  if (typeof window === "undefined") {
    // Server-side: return null or a placeholder
    return null;
  }

  // Client-side: use React.lazy
  return React.lazy(importFunc);
}

/**
 * Preload critical resources
 */
export function preloadCriticalResources() {
  if (typeof window === "undefined") return;

  // Preload critical fonts
  const fontLinks = [
    { href: "/fonts/geist-sans.woff2", type: "font/woff2" },
    { href: "/fonts/geist-mono.woff2", type: "font/woff2" },
  ];

  fontLinks.forEach(({ href, type }) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "font";
    link.type = type;
    link.href = href;
    link.crossOrigin = "anonymous";
    document.head.appendChild(link);
  });
}

/**
 * Defer non-critical scripts
 */
export function deferNonCriticalScripts() {
  if (typeof window === "undefined") return;

  // Defer analytics, social widgets, etc.
  window.addEventListener("load", () => {
    // Load non-critical scripts here after page load
    console.log("[Performance] Page loaded, loading deferred scripts...");
  });
}

/**
 * Optimize third-party scripts with facade pattern
 * Example: Lazy load YouTube embeds
 */
export function optimizeThirdPartyEmbeds() {
  if (typeof window === "undefined") return;

  const embedContainers = document.querySelectorAll("[data-embed-type]");

  const embedObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const container = entry.target as HTMLElement;
        const embedType = container.getAttribute("data-embed-type");
        const embedId = container.getAttribute("data-embed-id");

        if (embedType === "youtube" && embedId) {
          const iframe = document.createElement("iframe");
          iframe.src = `https://www.youtube.com/embed/${embedId}`;
          iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
          iframe.allowFullscreen = true;
          iframe.loading = "lazy";
          container.appendChild(iframe);
          embedObserver.unobserve(container);
        }
      }
    });
  });

  embedContainers.forEach((container) => embedObserver.observe(container));
}

/**
 * PERFORMANCE MONITORING UTILITIES
 * Tracks Web Vitals and generates optimization suggestions
 */

export interface PerformanceMetrics {
  FCP?: number; // First Contentful Paint (ms)
  LCP?: number; // Largest Contentful Paint (ms)
  TBT?: number; // Total Blocking Time (ms)
  CLS?: number; // Cumulative Layout Shift
  SI?: number; // Speed Index (ms)
  TTFB?: number; // Time to First Byte (ms)
}

/**
 * Calculate performance score (0-100) based on Web Vitals
 * Good: < 1.8s FCP, < 2.5s LCP, < 200ms TBT, < 0.1 CLS
 */
export function calculatePerformanceScore(metrics: PerformanceMetrics): {
  score: number;
  rating: "good" | "needs-improvement" | "poor";
} {
  let score = 0;
  let weight = 0;

  // FCP scoring (0-25 points)
  if (metrics.FCP !== undefined) {
    const fcp = metrics.FCP;
    const fcpScore = fcp < 1800 ? 25 : fcp < 3000 ? 15 : 0;
    score += fcpScore;
    weight += 25;
  }

  // LCP scoring (0-25 points)
  if (metrics.LCP !== undefined) {
    const lcp = metrics.LCP;
    const lcpScore = lcp < 2500 ? 25 : lcp < 4000 ? 15 : 0;
    score += lcpScore;
    weight += 25;
  }

  // TBT scoring (0-25 points)
  if (metrics.TBT !== undefined) {
    const tbt = metrics.TBT;
    const tbtScore = tbt < 200 ? 25 : tbt < 600 ? 10 : 0;
    score += tbtScore;
    weight += 25;
  }

  // CLS scoring (0-25 points)
  if (metrics.CLS !== undefined) {
    const cls = metrics.CLS;
    const clsScore = cls < 0.1 ? 25 : cls < 0.25 ? 15 : 0;
    score += clsScore;
    weight += 25;
  }

  const finalScore = weight > 0 ? Math.round((score / weight) * 100) : 0;
  const rating: "good" | "needs-improvement" | "poor" =
    finalScore >= 90 ? "good" : finalScore >= 50 ? "needs-improvement" : "poor";

  return { score: finalScore, rating };
}

/**
 * Get optimization suggestions based on metrics
 */
export function getOptimizationSuggestions(
  metrics: PerformanceMetrics
): string[] {
  const suggestions: string[] = [];

  if (metrics.FCP && metrics.FCP > 3000) {
    suggestions.push(
      "🔴 First Contentful Paint is slow (>3s). Defer JavaScript and CSS."
    );
  }

  if (metrics.LCP && metrics.LCP > 4000) {
    suggestions.push(
      "🔴 Largest Contentful Paint is slow (>4s). Optimize images and lazy-load content."
    );
  }

  if (metrics.TBT && metrics.TBT > 300) {
    suggestions.push("🟡 Long main-thread tasks detected. Break up JavaScript work.");
  }

  if (metrics.CLS && metrics.CLS > 0.1) {
    suggestions.push("🟡 Layout shifts detected. Set explicit dimensions on images/elements.");
  }

  if (metrics.TTFB && metrics.TTFB > 1000) {
    suggestions.push("🔴 Server response time is slow (>1s). Optimize backend or upgrade hosting.");
  }

  if (!suggestions.length) {
    suggestions.push("✅ Performance metrics are within good thresholds!");
  }

  return suggestions;
}

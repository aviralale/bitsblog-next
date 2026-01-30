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

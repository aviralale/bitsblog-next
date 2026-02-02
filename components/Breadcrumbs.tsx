"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { useState } from "react";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const [showFullBreadcrumbs, setShowFullBreadcrumbs] = useState(false);

  // Show limited breadcrumbs on mobile
  const shouldCollapse = items.length > 2;
  const displayItems =
    showFullBreadcrumbs || !shouldCollapse ? items : items.slice(-1);

  return (
    <nav aria-label="Breadcrumb" className="mb-4 sm:mb-6">
      <ol
        className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 flex-wrap"
        itemScope
        itemType="https://schema.org/BreadcrumbList"
      >
        {/* Home */}
        <li
          itemProp="itemListElement"
          itemScope
          itemType="https://schema.org/ListItem"
        >
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500 rounded px-1"
            itemProp="item"
            aria-label="Home"
          >
            <Home className="w-3 h-3 sm:w-4 sm:h-4" />
            <span itemProp="name" className="hidden sm:inline">
              Home
            </span>
          </Link>
          <meta itemProp="position" content="1" />
        </li>

        {/* Collapse indicator for mobile */}
        {shouldCollapse && !showFullBreadcrumbs && (
          <li className="flex items-center gap-1 sm:gap-2">
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
            <button
              onClick={() => setShowFullBreadcrumbs(true)}
              className="text-neutral-600 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500 rounded px-1"
              aria-label="Show full breadcrumb path"
            >
              ...
            </button>
          </li>
        )}

        {/* Dynamic breadcrumb items */}
        {displayItems.map((item, index) => (
          <li
            key={item.href}
            className="flex items-center gap-1 sm:gap-2"
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
          >
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            {index === displayItems.length - 1 ? (
              // Last item - not a link
              <span
                className="font-medium text-neutral-900 dark:text-neutral-100 break-words max-w-xs sm:max-w-none"
                itemProp="name"
                aria-current="page"
              >
                {item.label}
              </span>
            ) : (
              // Middle items - links
              <Link
                href={item.href}
                className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500 rounded px-1 break-words max-w-xs sm:max-w-none"
                itemProp="item"
              >
                <span itemProp="name">{item.label}</span>
              </Link>
            )}
            <meta
              itemProp="position"
              content={String(
                shouldCollapse && !showFullBreadcrumbs
                  ? displayItems.length
                  : index + 2,
              )}
            />
          </li>
        ))}
      </ol>
    </nav>
  );
}

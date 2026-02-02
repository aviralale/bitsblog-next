"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Search, ChevronDown } from "lucide-react";
import type { Tag } from "@/types";

interface SearchableTagsInputProps {
  selectedTags: number[];
  onTagsChange: (tagIds: number[]) => void;
  onSearch: (query: string) => Promise<Tag[]>;
  placeholder?: string;
}

export default function SearchableTagsInput({
  selectedTags,
  onTagsChange,
  onSearch,
  placeholder = "Search and select tags...",
}: SearchableTagsInputProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Tag[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTagObjects, setSelectedTagObjects] = useState<Tag[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLButtonElement[]>([]);

  // Initialize selected tags with their full objects
  useEffect(() => {
    // This will be updated when tags are loaded from the backend
    // For now, we'll work with just the IDs and fetch full data when needed
  }, []);

  // Debounced search function
  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query);

      // Clear previous timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      if (query.trim().length === 0) {
        // When empty, show all tags (search with empty string)
        try {
          setIsSearching(true);
          const results = await onSearch("");
          setSearchResults(results);
        } catch (error) {
          console.error("Failed to load tags:", error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
        return;
      }

      // Set new timeout for debounced search
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          setIsSearching(true);
          const results = await onSearch(query);
          setSearchResults(results);
        } catch (error) {
          console.error("Search error:", error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 300); // 300ms debounce
    },
    [onSearch],
  );

  // Filter out already selected tags from search results
  const filteredResults = searchResults.filter(
    (tag) => !selectedTags.includes(tag.id),
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen && e.key !== "Enter" && e.key !== "Escape") {
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setIsOpen(true);
          setHighlightedIndex((prev) =>
            prev < filteredResults.length - 1 ? prev + 1 : prev,
          );
          break;

        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;

        case "Enter":
          e.preventDefault();
          if (
            highlightedIndex >= 0 &&
            highlightedIndex < filteredResults.length
          ) {
            handleSelectTag(filteredResults[highlightedIndex]);
            setHighlightedIndex(-1);
          } else if (isOpen && filteredResults.length > 0) {
            // If dropdown is open but nothing highlighted, select first item
            handleSelectTag(filteredResults[0]);
            setHighlightedIndex(-1);
          }
          break;

        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          setHighlightedIndex(-1);
          break;

        case "Backspace":
          // If input is empty and there are selected tags, remove last tag
          if (searchQuery.length === 0 && selectedTagObjects.length > 0) {
            e.preventDefault();
            const lastTag = selectedTagObjects[selectedTagObjects.length - 1];
            handleRemoveTag(lastTag.id);
          }
          break;

        default:
          break;
      }
    },
    [
      highlightedIndex,
      filteredResults,
      isOpen,
      searchQuery,
      selectedTagObjects,
    ],
  );

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && optionsRef.current[highlightedIndex]) {
      optionsRef.current[highlightedIndex]?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [highlightedIndex]);

  // Reset highlighted index when results change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [filteredResults]);

  // Handle tag selection
  const handleSelectTag = (tag: Tag) => {
    if (!selectedTags.includes(tag.id)) {
      const newSelectedIds = [...selectedTags, tag.id];
      onTagsChange(newSelectedIds);
      setSelectedTagObjects([...selectedTagObjects, tag]);
    }
    setSearchQuery("");
    setSearchResults([]);
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  // Handle tag removal
  const handleRemoveTag = (tagId: number) => {
    const newSelectedIds = selectedTags.filter((id) => id !== tagId);
    onTagsChange(newSelectedIds);
    setSelectedTagObjects(selectedTagObjects.filter((tag) => tag.id !== tagId));
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="space-y-2">
      <div className="relative">
        {/* Input and selected tags container */}
        <div className="border border-neutral-300 focus-within:border-black rounded-none bg-white min-h-12 p-2 flex flex-wrap gap-2 items-start content-start">
          {/* Selected tags */}
          {selectedTagObjects.length > 0 &&
            selectedTagObjects.map((tag) => (
              <div
                key={tag.id}
                className="inline-flex items-center gap-2 bg-black text-white px-3 py-1 text-sm font-light"
              >
                <span>{tag.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag.id)}
                  className="hover:text-neutral-300 transition-colors focus:outline-none focus:ring-2 focus:ring-white rounded-none p-0.5"
                  aria-label={`Remove ${tag.name} tag`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}

          {/* Search input */}
          <div className="flex-1 min-w-48">
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsOpen(true)}
              placeholder={selectedTagObjects.length === 0 ? placeholder : ""}
              className="w-full bg-transparent outline-none text-sm font-light placeholder-neutral-400 focus:outline-none"
              aria-label="Search tags"
              aria-expanded={isOpen}
              aria-autocomplete="list"
              aria-controls="tags-dropdown"
              role="combobox"
            />
          </div>
        </div>

        {/* Search icon */}
        {!isSearching && selectedTagObjects.length === 0 && (
          <Search className="absolute right-3 top-3 h-4 w-4 text-neutral-400 pointer-events-none" />
        )}

        {/* Loading indicator */}
        {isSearching && (
          <div className="absolute right-3 top-3">
            <div className="w-4 h-4 border-2 border-neutral-300 border-t-black rounded-full animate-spin"></div>
          </div>
        )}

        {/* Dropdown results */}
        {isOpen && (
          <div
            ref={dropdownRef}
            id="tags-dropdown"
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-300 rounded-none z-50 max-h-64 overflow-y-auto shadow-lg"
            role="listbox"
          >
            {isSearching ? (
              <div className="p-4 text-center text-sm text-neutral-500 font-light">
                Searching...
              </div>
            ) : filteredResults.length > 0 ? (
              <ul className="divide-y divide-neutral-200" role="presentation">
                {filteredResults.map((tag, index) => {
                  const isHighlighted = index === highlightedIndex;
                  return (
                    <li key={tag.id} role="presentation">
                      <button
                        ref={(el) => {
                          if (el) optionsRef.current[index] = el;
                        }}
                        type="button"
                        onClick={() => handleSelectTag(tag)}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        className={`w-full text-left px-4 py-3 transition-colors text-sm font-light focus:outline-none focus:ring-2 focus:ring-black focus:ring-inset ${
                          isHighlighted
                            ? "bg-neutral-900 text-white"
                            : "hover:bg-neutral-50 text-black"
                        }`}
                        role="option"
                        aria-selected={isHighlighted}
                      >
                        <div className="font-medium">{tag.name}</div>
                        {tag.description && (
                          <div
                            className={`text-xs ${isHighlighted ? "text-neutral-300" : "text-neutral-500"}`}
                          >
                            {tag.description}
                          </div>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : searchQuery.trim().length > 0 ? (
              <div className="p-4 text-center text-sm text-neutral-500 font-light">
                No tags found
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Help text with keyboard shortcuts */}
      <div className="text-xs text-neutral-500 font-light space-y-1">
        <p>Search and select multiple tags. Type to search by name.</p>
        <p className="text-neutral-400">
          💡{" "}
          <kbd className="bg-neutral-100 px-2 py-0.5 rounded text-xs">↑↓</kbd>{" "}
          Navigate{" "}
          <kbd className="bg-neutral-100 px-2 py-0.5 rounded text-xs">↵</kbd>{" "}
          Select{" "}
          <kbd className="bg-neutral-100 px-2 py-0.5 rounded text-xs">Esc</kbd>{" "}
          Close{" "}
          <kbd className="bg-neutral-100 px-2 py-0.5 rounded text-xs">⌫</kbd>{" "}
          Remove last
        </p>
      </div>
    </div>
  );
}

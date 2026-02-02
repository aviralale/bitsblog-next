"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Search as SearchIcon } from "lucide-react";

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  compact?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  className = "",
  placeholder = "Search articles...",
  compact = false,
}) => {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/search");
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className={`flex gap-2 ${className}`}
      role="search"
      aria-label="Article search"
    >
      <div className="flex-1 relative">
        <SearchIcon className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-neutral-400 flex-shrink-0" />
        <Input
          type="search"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={`pl-9 sm:pl-12 border-neutral-300 focus:border-black rounded-none font-light transition-all duration-200 ${
            compact ? "h-10" : "h-11 sm:h-12"
          }`}
          aria-label="Search query"
        />
      </div>
      <Button
        type="submit"
        className={`bg-black text-white hover:bg-neutral-800 font-light rounded-none transition-all duration-200 px-3 sm:px-6 ${
          compact ? "h-10" : "h-11 sm:h-12"
        }`}
        aria-label="Submit search"
      >
        <SearchIcon className="h-4 w-4" />
        <span className="hidden sm:inline ml-2">Search</span>
      </Button>
    </form>
  );
};

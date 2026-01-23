"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Search as SearchIcon } from "lucide-react";

interface SearchBarProps {
  className?: string;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  className = "",
  placeholder = "Search articles...",
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
    <form onSubmit={handleSearch} className={`flex gap-2 ${className}`}>
      <div className="flex-1 relative">
        <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-12 border-neutral-300 focus:border-black rounded-none h-12 font-light"
        />
      </div>
      <Button
        type="submit"
        className="bg-black text-white hover:bg-neutral-800 font-light rounded-none h-12 px-6"
      >
        <SearchIcon className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">Search</span>
      </Button>
    </form>
  );
};

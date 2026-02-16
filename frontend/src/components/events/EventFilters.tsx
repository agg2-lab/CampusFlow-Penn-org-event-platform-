"use client";

import { useState } from "react";
import { Search, Filter, X, Calendar, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

const popularTags = [
  "Social",
  "Academic",
  "Career",
  "Sports",
  "Arts",
  "Music",
  "Tech",
  "Community",
  "Networking",
  "Workshop",
];

interface EventFiltersProps {
  onSearch: (query: string) => void;
  onTagFilter: (tags: string[]) => void;
  onDateFilter: (start?: string, end?: string) => void;
}

export function EventFilters({
  onSearch,
  onTagFilter,
  onDateFilter,
}: EventFiltersProps) {
  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  const toggleTag = (tag: string) => {
    const next = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(next);
    onTagFilter(next);
  };

  const handleDateChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    onDateFilter(start || undefined, end || undefined);
  };

  const clearAll = () => {
    setQuery("");
    setSelectedTags([]);
    setStartDate("");
    setEndDate("");
    onSearch("");
    onTagFilter([]);
    onDateFilter(undefined, undefined);
  };

  const hasFilters = query || selectedTags.length || startDate || endDate;

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search events by name, description, or tag..."
            className="input pl-10"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "btn-secondary",
            showFilters && "bg-brand-50 border-brand-300 text-brand-700"
          )}
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasFilters && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-xs text-white">
              {(selectedTags.length > 0 ? 1 : 0) +
                (startDate || endDate ? 1 : 0) +
                (query ? 1 : 0)}
            </span>
          )}
        </button>
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="animate-slide-up rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
            {hasFilters && (
              <button
                onClick={clearAll}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
              >
                <X className="h-3.5 w-3.5" />
                Clear all
              </button>
            )}
          </div>

          {/* Date range */}
          <div className="mt-4">
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
              <Calendar className="h-4 w-4" />
              Date Range
            </label>
            <div className="mt-2 flex gap-3">
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleDateChange(e.target.value, endDate)}
                className="input flex-1"
              />
              <span className="flex items-center text-gray-400">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => handleDateChange(startDate, e.target.value)}
                className="input flex-1"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="mt-4">
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
              <Tag className="h-4 w-4" />
              Tags
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    "rounded-full px-3 py-1 text-sm font-medium transition-colors",
                    selectedTags.includes(tag)
                      ? "bg-brand-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { EventCard } from "@/components/events/EventCard";
import { EventFilters } from "@/components/events/EventFilters";
import type { Event, Pagination } from "@/types";

export default function EventsPage() {
  const { isAuthenticated } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [recommended, setRecommended] = useState<Event[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ q: "", tags: "", startDate: "", endDate: "" });
  const [showRecommended, setShowRecommended] = useState(true);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "12");
      if (filters.q) params.set("q", filters.q);
      if (filters.tags) params.set("tag", filters.tags);
      if (filters.startDate) params.set("startDate", filters.startDate);
      if (filters.endDate) params.set("endDate", filters.endDate);

      const data = await api.get<{ events: Event[]; pagination: Pagination }>(
        `/events?${params.toString()}`
      );
      setEvents(data.events);
      setPagination(data.pagination);
    } catch (err) {
      console.error("Failed to fetch events:", err);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  const fetchRecommended = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await api.get<{ events: Event[] }>("/events/recommended");
      setRecommended(data.events);
    } catch (err) {
      console.error("Failed to fetch recommended:", err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    fetchRecommended();
  }, [fetchRecommended]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Events</h1>
          <p className="section-subtitle">
            Discover events from student organizations across campus
          </p>
        </div>
        {isAuthenticated && (
          <Link href="/events/create" className="btn-primary">
            <Plus className="h-4 w-4" />
            Create Event
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="mt-6">
        <EventFilters
          onSearch={(q) => {
            setFilters((f) => ({ ...f, q }));
            setPage(1);
          }}
          onTagFilter={(tags) => {
            setFilters((f) => ({ ...f, tags: tags.join(",") }));
            setPage(1);
          }}
          onDateFilter={(startDate, endDate) => {
            setFilters((f) => ({
              ...f,
              startDate: startDate || "",
              endDate: endDate || "",
            }));
            setPage(1);
          }}
        />
      </div>

      {/* Recommended events */}
      {isAuthenticated && recommended.length > 0 && showRecommended && (
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Sparkles className="h-5 w-5 text-amber-500" />
              Recommended for You
            </h2>
            <button
              onClick={() => setShowRecommended(false)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Hide
            </button>
          </div>
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recommended.slice(0, 3).map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        </div>
      )}

      {/* Events grid */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900">
          {filters.q || filters.tags ? "Search Results" : "All Events"}
          {pagination && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({pagination.total} events)
            </span>
          )}
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
          </div>
        ) : events.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-lg text-gray-500">No events found</p>
            <p className="mt-1 text-sm text-gray-400">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-secondary"
            >
              Previous
            </button>
            <span className="px-4 text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="btn-secondary"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

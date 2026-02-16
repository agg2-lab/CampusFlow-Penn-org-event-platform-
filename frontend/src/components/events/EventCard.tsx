"use client";

import Link from "next/link";
import { Calendar, MapPin, Users, Tag, Clock } from "lucide-react";
import { formatEventDate, isEventPast, formatCurrency, cn } from "@/lib/utils";
import type { Event } from "@/types";

interface EventCardProps {
  event: Event;
  compact?: boolean;
}

export function EventCard({ event, compact = false }: EventCardProps) {
  const past = isEventPast(event.endDate);

  return (
    <Link href={`/events/${event._id}`}>
      <div
        className={cn(
          "card group cursor-pointer overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg",
          past && "opacity-70"
        )}
      >
        {/* Cover Image */}
        {event.coverImage && !compact && (
          <div className="-mx-6 -mt-6 mb-4 h-40 overflow-hidden">
            <img
              src={event.coverImage}
              alt={event.title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {event.isFree ? (
            <span className="badge-green">Free</span>
          ) : (
            <span className="badge-blue">{formatCurrency(event.ticketPrice)}</span>
          )}
          {event.isVirtual && <span className="badge-gray">Virtual</span>}
          {past && <span className="badge-red">Past</span>}
          {event.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="badge-gray">
              {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h3 className="mt-3 text-lg font-semibold text-gray-900 group-hover:text-brand-600">
          {event.title}
        </h3>

        {/* Org */}
        <p className="mt-1 text-sm text-gray-500">{event.orgName}</p>

        {/* Meta */}
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4 shrink-0 text-gray-400" />
            {formatEventDate(event.startDate)}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
            {event.location}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users className="h-4 w-4 shrink-0 text-gray-400" />
            {event.rsvpCount} / {event.capacity} attending
          </div>
        </div>

        {/* Capacity bar */}
        <div className="mt-3">
          <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                event.rsvpCount / event.capacity > 0.9
                  ? "bg-red-500"
                  : event.rsvpCount / event.capacity > 0.7
                    ? "bg-amber-500"
                    : "bg-brand-500"
              )}
              style={{
                width: `${Math.min((event.rsvpCount / event.capacity) * 100, 100)}%`,
              }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Users,
  Tag,
  ExternalLink,
  Ticket,
  QrCode,
  ArrowLeft,
  Share2,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { formatEventDate, formatCurrency, isEventPast, cn } from "@/lib/utils";
import type { Event, Ticket as TicketType } from "@/types";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [ticket, setTicket] = useState<TicketType | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const data = await api.get<{ event: Event }>(`/events/${params.id}`);
        setEvent(data.event);
      } catch {
        setError("Event not found");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [params.id]);

  const handleRSVP = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    setRsvpLoading(true);
    setError("");

    try {
      const data = await api.post<{ ticket: TicketType }>(
        `/events/${params.id}/rsvp`
      );
      setTicket(data.ticket);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRsvpLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="py-32 text-center">
        <p className="text-lg text-gray-500">{error || "Event not found"}</p>
        <Link href="/events" className="btn-secondary mt-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Link>
      </div>
    );
  }

  const past = isEventPast(event.endDate);
  const full = event.rsvpCount >= event.capacity;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back */}
      <Link
        href="/events"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Events
      </Link>

      {/* Cover image */}
      {event.coverImage && (
        <div className="mb-6 h-64 overflow-hidden rounded-2xl sm:h-80">
          <img
            src={event.coverImage}
            alt={event.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2">
          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {event.isFree ? (
              <span className="badge-green">Free</span>
            ) : (
              <span className="badge-blue">{formatCurrency(event.ticketPrice)}</span>
            )}
            {event.isVirtual && <span className="badge-gray">Virtual</span>}
            {past && <span className="badge-red">Past Event</span>}
            {event.tags.map((tag) => (
              <span key={tag} className="badge-gray">
                {tag}
              </span>
            ))}
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
            {event.title}
          </h1>

          <p className="mt-2 text-gray-500">
            Hosted by{" "}
            <Link
              href={`/orgs/${event.orgId}`}
              className="font-medium text-brand-600 hover:underline"
            >
              {event.orgName}
            </Link>
          </p>

          {/* Details */}
          <div className="mt-6 space-y-3">
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">
                  {formatEventDate(event.startDate)}
                </p>
                <p className="text-sm text-gray-500">
                  Ends {formatEventDate(event.endDate)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">{event.location}</p>
                {event.isVirtual && event.virtualLink && (
                  <a
                    href={event.virtualLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-brand-600 hover:underline"
                  >
                    Join virtually <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-gray-400" />
              <p className="text-gray-900">
                <span className="font-medium">{event.rsvpCount}</span> /{" "}
                {event.capacity} attending
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900">About this event</h2>
            <div className="mt-3 whitespace-pre-wrap text-gray-600 leading-relaxed">
              {event.description}
            </div>
          </div>
        </div>

        {/* Sidebar — RSVP */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            {ticket ? (
              <div className="text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                <h3 className="mt-3 text-lg font-semibold text-gray-900">
                  You&apos;re going!
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Show this QR code at check-in
                </p>
                {ticket.qrCode && (
                  <img
                    src={ticket.qrCode}
                    alt="Ticket QR Code"
                    className="mx-auto mt-4 h-48 w-48 rounded-lg border"
                  />
                )}
                <Link
                  href={`/checkin/${event._id}`}
                  className="btn-secondary mt-4 w-full"
                >
                  <QrCode className="h-4 w-4" />
                  View Check-In
                </Link>
              </div>
            ) : (
              <>
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900">
                    {event.isFree ? "Free" : formatCurrency(event.ticketPrice)}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {event.capacity - event.rsvpCount} spots remaining
                  </p>
                </div>

                {/* Capacity bar */}
                <div className="mt-4">
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        full ? "bg-red-500" : "bg-brand-500"
                      )}
                      style={{
                        width: `${Math.min((event.rsvpCount / event.capacity) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {error && (
                  <p className="mt-3 text-center text-sm text-red-600">{error}</p>
                )}

                <button
                  onClick={handleRSVP}
                  disabled={past || full || rsvpLoading}
                  className="btn-primary mt-4 w-full"
                >
                  {rsvpLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : past ? (
                    "Event has ended"
                  ) : full ? (
                    "Event is full"
                  ) : (
                    <>
                      <Ticket className="h-4 w-4" />
                      {event.isFree ? "RSVP Free" : "Get Ticket"}
                    </>
                  )}
                </button>
              </>
            )}

            {/* Share */}
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
              }}
              className="btn-secondary mt-3 w-full"
            >
              <Share2 className="h-4 w-4" />
              Share Event
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

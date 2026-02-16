"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Tag,
  Users,
  DollarSign,
  Image,
  Globe,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { Organization } from "@/types";

const tagOptions = [
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
  "Food",
  "Fundraiser",
];

export default function CreateEventPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    orgId: "",
    orgName: "",
    location: "",
    isVirtual: false,
    virtualLink: "",
    startDate: "",
    endDate: "",
    tags: [] as string[],
    capacity: 100,
    ticketPrice: 0,
    coverImage: "",
  });

  useEffect(() => {
    if (!isAuthenticated) return;
    api
      .get<{ organizations: Organization[] }>("/orgs/mine")
      .then((data) => setOrgs(data.organizations))
      .catch(console.error);
  }, [isAuthenticated]);

  const handleOrgChange = (orgId: string) => {
    const org = orgs.find((o) => o.id === orgId);
    setForm((f) => ({ ...f, orgId, orgName: org?.name || "" }));
  };

  const toggleTag = (tag: string) => {
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(tag)
        ? f.tags.filter((t) => t !== tag)
        : [...f.tags, tag],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await api.post<{ event: { _id: string } }>("/events", form);
      router.push(`/events/${data.event._id}`);
    } catch (err: any) {
      setError(err.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="py-32 text-center">
        <p className="text-lg text-gray-500">Please sign in to create an event</p>
        <Link href="/login" className="btn-primary mt-4">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/events"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Events
      </Link>

      <h1 className="section-title">Create Event</h1>
      <p className="section-subtitle">
        Fill out the details below to create a new event for your organization.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Organization */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Organization *
          </label>
          <select
            value={form.orgId}
            onChange={(e) => handleOrgChange(e.target.value)}
            className="input"
            required
          >
            <option value="">Select an organization</option>
            {orgs.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name} ({org.role})
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Event Title *
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="e.g., Spring Gala 2026"
            className="input"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Description *
          </label>
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            placeholder="Tell people what your event is about..."
            className="input min-h-[120px] resize-y"
            required
          />
        </div>

        {/* Date/Time */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
              <Calendar className="h-4 w-4" />
              Start Date & Time *
            </label>
            <input
              type="datetime-local"
              value={form.startDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, startDate: e.target.value }))
              }
              className="input"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
              <Calendar className="h-4 w-4" />
              End Date & Time *
            </label>
            <input
              type="datetime-local"
              value={form.endDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, endDate: e.target.value }))
              }
              className="input"
              required
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
            <MapPin className="h-4 w-4" />
            Location *
          </label>
          <input
            type="text"
            value={form.location}
            onChange={(e) =>
              setForm((f) => ({ ...f, location: e.target.value }))
            }
            placeholder="e.g., Houston Hall, Room 200"
            className="input"
            required
          />
        </div>

        {/* Virtual toggle */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isVirtual"
            checked={form.isVirtual}
            onChange={(e) =>
              setForm((f) => ({ ...f, isVirtual: e.target.checked }))
            }
            className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
          />
          <label htmlFor="isVirtual" className="flex items-center gap-1.5 text-sm text-gray-700">
            <Globe className="h-4 w-4" />
            This is a virtual/hybrid event
          </label>
        </div>

        {form.isVirtual && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Virtual Link
            </label>
            <input
              type="url"
              value={form.virtualLink}
              onChange={(e) =>
                setForm((f) => ({ ...f, virtualLink: e.target.value }))
              }
              placeholder="https://zoom.us/..."
              className="input"
            />
          </div>
        )}

        {/* Capacity & Price */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
              <Users className="h-4 w-4" />
              Capacity
            </label>
            <input
              type="number"
              value={form.capacity}
              onChange={(e) =>
                setForm((f) => ({ ...f, capacity: parseInt(e.target.value) || 100 }))
              }
              min={1}
              className="input"
            />
          </div>
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
              <DollarSign className="h-4 w-4" />
              Ticket Price ($0 = free)
            </label>
            <input
              type="number"
              value={form.ticketPrice}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  ticketPrice: parseFloat(e.target.value) || 0,
                }))
              }
              min={0}
              step="0.01"
              className="input"
            />
          </div>
        </div>

        {/* Cover Image */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
            <Image className="h-4 w-4" />
            Cover Image URL
          </label>
          <input
            type="url"
            value={form.coverImage}
            onChange={(e) =>
              setForm((f) => ({ ...f, coverImage: e.target.value }))
            }
            placeholder="https://images.unsplash.com/..."
            className="input"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
            <Tag className="h-4 w-4" />
            Tags
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {tagOptions.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                  form.tags.includes(tag)
                    ? "bg-brand-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3 border-t border-gray-200 pt-6">
          <Link href="/events" className="btn-secondary">
            Cancel
          </Link>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Create Event"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

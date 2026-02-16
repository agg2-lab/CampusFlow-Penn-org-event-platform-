"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Users,
  Ticket,
  BarChart3,
  Plus,
  QrCode,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { EventCard } from "@/components/events/EventCard";
import type { Organization, Event as EventType, OrgDashboard } from "@/types";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<string>("");
  const [dashboard, setDashboard] = useState<OrgDashboard | null>(null);
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    api
      .get<{ organizations: Organization[] }>("/orgs/mine")
      .then((data) => {
        setOrgs(data.organizations);
        if (data.organizations.length > 0) {
          setSelectedOrg(data.organizations[0].id);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [isAuthenticated]);

  useEffect(() => {
    if (!selectedOrg) return;
    Promise.all([
      api.get<OrgDashboard>(`/analytics/org/${selectedOrg}/dashboard`),
      api.get<{ events: EventType[] }>(`/events?org=${selectedOrg}&limit=6`),
    ])
      .then(([dash, evts]) => {
        setDashboard(dash);
        setEvents(evts.events);
      })
      .catch(console.error);
  }, [selectedOrg]);

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="py-32 text-center">
        <p className="text-lg text-gray-500">Sign in to access your dashboard</p>
        <Link href="/login" className="btn-primary mt-4">
          Sign In
        </Link>
      </div>
    );
  }

  if (orgs.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <Users className="mx-auto h-16 w-16 text-gray-300" />
        <h2 className="mt-4 text-xl font-semibold text-gray-900">
          No organizations yet
        </h2>
        <p className="mt-2 text-gray-500">
          Create or join an organization to access the dashboard.
        </p>
        <Link href="/orgs/create" className="btn-primary mt-6">
          <Plus className="h-4 w-4" />
          Create Organization
        </Link>
      </div>
    );
  }

  const statsCards = dashboard
    ? [
        {
          label: "Total Events",
          value: dashboard.totalEvents,
          icon: Calendar,
          color: "text-blue-600 bg-blue-100",
        },
        {
          label: "Total RSVPs",
          value: dashboard.totalRSVPs,
          icon: Ticket,
          color: "text-green-600 bg-green-100",
        },
        {
          label: "Check-Ins",
          value: dashboard.totalCheckIns,
          icon: QrCode,
          color: "text-purple-600 bg-purple-100",
        },
        {
          label: "Members",
          value: dashboard.totalMembers,
          icon: Users,
          color: "text-amber-600 bg-amber-100",
        },
        {
          label: "Check-In Rate",
          value: `${dashboard.checkInRate}%`,
          icon: BarChart3,
          color: "text-pink-600 bg-pink-100",
        },
        {
          label: "Revenue",
          value: `$${dashboard.totalRevenue.toFixed(2)}`,
          icon: BarChart3,
          color: "text-emerald-600 bg-emerald-100",
        },
      ]
    : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="section-title">Dashboard</h1>
          <p className="section-subtitle">Welcome back, {user?.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedOrg}
            onChange={(e) => setSelectedOrg(e.target.value)}
            className="input max-w-xs"
          >
            {orgs.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
          <Link href="/events/create" className="btn-primary">
            <Plus className="h-4 w-4" />
            New Event
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      {dashboard && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {statsCards.map((stat) => (
            <div key={stat.label} className="card flex items-center gap-4">
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl",
                  stat.color
                )}
              >
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick actions */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Link
          href="/events/create"
          className="card flex items-center gap-3 hover:border-brand-300"
        >
          <Calendar className="h-5 w-5 text-brand-600" />
          <span className="font-medium text-gray-900">Create Event</span>
          <ArrowRight className="ml-auto h-4 w-4 text-gray-400" />
        </Link>
        <Link
          href={`/checkin/${events[0]?._id || ""}`}
          className="card flex items-center gap-3 hover:border-brand-300"
        >
          <QrCode className="h-5 w-5 text-purple-600" />
          <span className="font-medium text-gray-900">Scan Check-In</span>
          <ArrowRight className="ml-auto h-4 w-4 text-gray-400" />
        </Link>
        <Link
          href="/admin"
          className="card flex items-center gap-3 hover:border-brand-300"
        >
          <BarChart3 className="h-5 w-5 text-green-600" />
          <span className="font-medium text-gray-900">View Analytics</span>
          <ArrowRight className="ml-auto h-4 w-4 text-gray-400" />
        </Link>
      </div>

      {/* Recent events */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Events</h2>
          <Link
            href="/events"
            className="text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            View All
          </Link>
        </div>
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event._id} event={event} compact />
          ))}
        </div>
      </div>
    </div>
  );
}

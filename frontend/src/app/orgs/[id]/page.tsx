"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Calendar,
  ArrowLeft,
  Crown,
  Shield,
  UserCircle,
  Loader2,
} from "lucide-react";
import { api } from "@/lib/api";
import { EventCard } from "@/components/events/EventCard";
import type { Organization, Membership, Event as EventType } from "@/types";
import { cn } from "@/lib/utils";

const roleIcons = {
  admin: Crown,
  officer: Shield,
  member: UserCircle,
};

const roleColors = {
  admin: "text-amber-600 bg-amber-50",
  officer: "text-blue-600 bg-blue-50",
  member: "text-gray-600 bg-gray-50",
};

export default function OrgDetailPage() {
  const params = useParams();
  const [org, setOrg] = useState<Organization | null>(null);
  const [members, setMembers] = useState<Membership[]>([]);
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"events" | "members">("events");

  useEffect(() => {
    const fetchOrg = async () => {
      try {
        const [orgData, eventsData] = await Promise.all([
          api.get<{ organization: Organization; members: Membership[] }>(
            `/orgs/${params.id}`
          ),
          api.get<{ events: EventType[] }>(`/events?org=${params.id}&limit=50`),
        ]);
        setOrg(orgData.organization);
        setMembers(orgData.members);
        setEvents(eventsData.events);
      } catch (err) {
        console.error("Failed to fetch org:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrg();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="py-32 text-center">
        <p className="text-lg text-gray-500">Organization not found</p>
        <Link href="/orgs" className="btn-secondary mt-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Organizations
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/orgs"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Organizations
      </Link>

      {/* Org header */}
      <div className="card">
        <div className="flex items-start gap-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
            {org.logo_url ? (
              <img
                src={org.logo_url}
                alt={org.name}
                className="h-20 w-20 rounded-2xl object-cover"
              />
            ) : (
              <Users className="h-10 w-10" />
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{org.name}</h1>
            {org.category && (
              <span className="badge-blue mt-1">{org.category}</span>
            )}
            <p className="mt-2 text-gray-600">{org.description}</p>
            <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" /> {members.length} members
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" /> {events.length} events
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 rounded-lg bg-gray-100 p-1">
        <button
          onClick={() => setTab("events")}
          className={cn(
            "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors",
            tab === "events"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          <Calendar className="mr-1.5 inline h-4 w-4" />
          Events ({events.length})
        </button>
        <button
          onClick={() => setTab("members")}
          className={cn(
            "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors",
            tab === "members"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          <Users className="mr-1.5 inline h-4 w-4" />
          Members ({members.length})
        </button>
      </div>

      {/* Tab content */}
      <div className="mt-6">
        {tab === "events" && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.length === 0 ? (
              <div className="col-span-full py-12 text-center text-gray-500">
                No events yet
              </div>
            ) : (
              events.map((event) => (
                <EventCard key={event._id} event={event} />
              ))
            )}
          </div>
        )}

        {tab === "members" && (
          <div className="space-y-2">
            {members.map((member) => {
              const RoleIcon = roleIcons[member.role];
              return (
                <div
                  key={member.id}
                  className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-5 py-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                    {member.avatar_url ? (
                      <img
                        src={member.avatar_url}
                        alt={member.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <UserCircle className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                  <div
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
                      roleColors[member.role]
                    )}
                  >
                    <RoleIcon className="h-3.5 w-3.5" />
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

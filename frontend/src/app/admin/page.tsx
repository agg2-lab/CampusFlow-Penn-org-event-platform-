"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  DollarSign,
  Loader2,
  ArrowUpRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { cn, formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import type {
  Organization,
  OrgDashboard,
  EventAnalytics,
  AttendanceTrend,
  Event as EventType,
} from "@/types";

const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

export default function AdminPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState("");
  const [dashboard, setDashboard] = useState<OrgDashboard | null>(null);
  const [trends, setTrends] = useState<AttendanceTrend[]>([]);
  const [events, setEvents] = useState<EventType[]>([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [eventAnalytics, setEventAnalytics] = useState<EventAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user's orgs
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

  // Load org dashboard + trends
  useEffect(() => {
    if (!selectedOrg) return;
    Promise.all([
      api.get<OrgDashboard>(`/analytics/org/${selectedOrg}/dashboard`),
      api.get<{ trends: AttendanceTrend[] }>(
        `/analytics/org/${selectedOrg}/trends`
      ),
      api.get<{ events: EventType[] }>(`/events?org=${selectedOrg}&limit=50`),
    ])
      .then(([dash, trendsData, eventsData]) => {
        setDashboard(dash);
        setTrends(trendsData.trends);
        setEvents(eventsData.events);
        if (eventsData.events.length > 0) {
          setSelectedEvent(eventsData.events[0]._id);
        }
      })
      .catch(console.error);
  }, [selectedOrg]);

  // Load event analytics
  useEffect(() => {
    if (!selectedEvent) return;
    api
      .get<EventAnalytics>(`/analytics/event/${selectedEvent}`)
      .then(setEventAnalytics)
      .catch(console.error);
  }, [selectedEvent]);

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
        <p className="text-lg text-gray-500">Sign in to access analytics</p>
        <Link href="/login" className="btn-primary mt-4">
          Sign In
        </Link>
      </div>
    );
  }

  if (orgs.length === 0) {
    return (
      <div className="py-32 text-center">
        <BarChart3 className="mx-auto h-12 w-12 text-gray-300" />
        <p className="mt-3 text-lg text-gray-500">
          Join or create an org to see analytics
        </p>
      </div>
    );
  }

  const ticketPieData = eventAnalytics
    ? [
        { name: "Active", value: eventAnalytics.tickets.active },
        { name: "Used", value: eventAnalytics.tickets.used },
        { name: "Cancelled", value: eventAnalytics.tickets.cancelled },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="section-title">Analytics Dashboard</h1>
          <p className="section-subtitle">
            Track attendance, revenue, and engagement
          </p>
        </div>
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
      </div>

      {/* KPI Cards */}
      {dashboard && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            label="Total RSVPs"
            value={dashboard.totalRSVPs.toString()}
            icon={Users}
            color="blue"
          />
          <KPICard
            label="Check-In Rate"
            value={`${dashboard.checkInRate}%`}
            icon={dashboard.checkInRate >= 50 ? TrendingUp : TrendingDown}
            color={dashboard.checkInRate >= 50 ? "green" : "red"}
          />
          <KPICard
            label="Total Events"
            value={dashboard.totalEvents.toString()}
            icon={Calendar}
            color="purple"
          />
          <KPICard
            label="Revenue"
            value={formatCurrency(dashboard.totalRevenue)}
            icon={DollarSign}
            color="emerald"
          />
        </div>
      )}

      {/* Attendance Trends Chart */}
      {trends.length > 0 && (
        <div className="mt-8 card">
          <h2 className="text-lg font-semibold text-gray-900">
            Attendance Trends (Last 30 Days)
          </h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="title"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) =>
                    v.length > 15 ? v.slice(0, 15) + "..." : v
                  }
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar
                  dataKey="rsvps"
                  fill="#93c5fd"
                  name="RSVPs"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="checkIns"
                  fill="#3b82f6"
                  name="Check-Ins"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Event-Level Analytics */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Event Analytics
          </h2>
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="input max-w-xs"
          >
            {events.map((evt) => (
              <option key={evt._id} value={evt._id}>
                {evt.title}
              </option>
            ))}
          </select>
        </div>

        {eventAnalytics && (
          <div className="mt-4 grid gap-6 lg:grid-cols-2">
            {/* Attendance funnel */}
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-900">
                Attendance Funnel
              </h3>
              <div className="mt-4 space-y-3">
                <FunnelRow
                  label="Capacity"
                  value={eventAnalytics.attendance.capacity}
                  max={eventAnalytics.attendance.capacity}
                  color="bg-gray-200"
                />
                <FunnelRow
                  label="RSVPs"
                  value={eventAnalytics.attendance.rsvps}
                  max={eventAnalytics.attendance.capacity}
                  color="bg-blue-400"
                />
                <FunnelRow
                  label="Check-Ins"
                  value={eventAnalytics.attendance.checkIns}
                  max={eventAnalytics.attendance.capacity}
                  color="bg-green-500"
                />
                <FunnelRow
                  label="Drop-Off"
                  value={eventAnalytics.attendance.dropOff}
                  max={eventAnalytics.attendance.capacity}
                  color="bg-red-400"
                />
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                <span className="text-sm text-gray-500">Conversion Rate</span>
                <span className="text-lg font-bold text-brand-600">
                  {eventAnalytics.attendance.conversionRate}%
                </span>
              </div>
            </div>

            {/* Ticket breakdown pie */}
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-900">
                Ticket Status Breakdown
              </h3>
              {ticketPieData.length > 0 ? (
                <div className="mt-4 h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={ticketPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {ticketPieData.map((_, i) => (
                          <Cell
                            key={i}
                            fill={PIE_COLORS[i % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="mt-8 text-center text-sm text-gray-400">
                  No ticket data available
                </p>
              )}
              <div className="mt-2 text-center">
                <p className="text-sm text-gray-500">
                  Revenue:{" "}
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(eventAnalytics.revenue)}
                  </span>
                </p>
              </div>
            </div>

            {/* Hourly check-in chart */}
            {eventAnalytics.hourlyCheckIns.length > 0 && (
              <div className="card lg:col-span-2">
                <h3 className="text-sm font-semibold text-gray-900">
                  Check-In Timeline
                </h3>
                <div className="mt-4 h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={eventAnalytics.hourlyCheckIns}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis
                        dataKey="hour"
                        tick={{ fontSize: 11 }}
                        tickFormatter={(v) => {
                          try {
                            return format(new Date(v + ":00:00Z"), "ha");
                          } catch {
                            return v;
                          }
                        }}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: "#3b82f6", r: 4 }}
                        name="Check-Ins"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Helper components ──

function KPICard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: any;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    blue: "text-blue-600 bg-blue-100",
    green: "text-green-600 bg-green-100",
    red: "text-red-600 bg-red-100",
    purple: "text-purple-600 bg-purple-100",
    emerald: "text-emerald-600 bg-emerald-100",
  };

  return (
    <div className="card flex items-center gap-4">
      <div
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-xl",
          colorMap[color]
        )}
      >
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function FunnelRow({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-900">{value}</span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

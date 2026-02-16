"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  QrCode,
  UserPlus,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Users,
  Loader2,
  Wifi,
} from "lucide-react";
import { io, Socket } from "socket.io-client";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { QRScanner } from "@/components/checkin/QRScanner";
import { cn, formatRelative } from "@/lib/utils";
import type { CheckIn as CheckInType } from "@/types";

export default function CheckInPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const { isAuthenticated } = useAuth();

  const [mode, setMode] = useState<"qr" | "manual">("qr");
  const [checkIns, setCheckIns] = useState<CheckInType[]>([]);
  const [stats, setStats] = useState({ totalTickets: 0, checkedIn: 0, checkInRate: 0 });
  const [scanning, setScanning] = useState(false);
  const [lastResult, setLastResult] = useState<{
    success: boolean;
    message: string;
    attendee?: string;
  } | null>(null);
  const [manualEmail, setManualEmail] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  // Fetch initial data
  useEffect(() => {
    if (!eventId) return;

    Promise.all([
      api.get<{ checkIns: CheckInType[]; total: number }>(
        `/checkin/event/${eventId}`
      ),
      api.get<typeof stats>(`/checkin/event/${eventId}/stats`),
    ])
      .then(([checkInData, statsData]) => {
        setCheckIns(checkInData.checkIns);
        setStats(statsData);
      })
      .catch(console.error);
  }, [eventId]);

  // Socket.io for real-time updates
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const s = io(apiUrl.replace("/api", ""), { withCredentials: true });

    s.on("connect", () => {
      setConnected(true);
      s.emit("join-event", eventId);
    });

    s.on("disconnect", () => setConnected(false));

    s.on("new-checkin", (checkIn: CheckInType) => {
      setCheckIns((prev) => [checkIn, ...prev]);
      setStats((prev) => ({
        ...prev,
        checkedIn: prev.checkedIn + 1,
        checkInRate:
          prev.totalTickets > 0
            ? Math.round(((prev.checkedIn + 1) / prev.totalTickets) * 100)
            : 0,
      }));
    });

    setSocket(s);

    return () => {
      s.emit("leave-event", eventId);
      s.disconnect();
    };
  }, [eventId]);

  const handleQRScan = useCallback(
    async (data: string) => {
      if (scanning) return;
      setScanning(true);
      setLastResult(null);

      try {
        const result = await api.post<{ checkIn: CheckInType }>("/checkin/qr", {
          qrData: data,
        });
        setLastResult({
          success: true,
          message: "Check-in successful!",
          attendee: result.checkIn.attendee?.name,
        });
      } catch (err: any) {
        setLastResult({
          success: false,
          message: err.message || "Check-in failed",
        });
      } finally {
        setScanning(false);
        setTimeout(() => setLastResult(null), 4000);
      }
    },
    [scanning]
  );

  const handleManualCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setScanning(true);
    setLastResult(null);

    try {
      const result = await api.post<{ checkIn: CheckInType }>(
        "/checkin/manual",
        { eventId, userId: manualEmail }
      );
      setLastResult({
        success: true,
        message: "Manual check-in successful!",
        attendee: result.checkIn.attendee?.name,
      });
      setManualEmail("");
    } catch (err: any) {
      setLastResult({
        success: false,
        message: err.message || "Check-in failed",
      });
    } finally {
      setScanning(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="py-32 text-center">
        <p className="text-lg text-gray-500">Sign in to manage check-ins</p>
        <Link href="/login" className="btn-primary mt-4">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Event Check-In</h1>
          <p className="section-subtitle">
            Scan QR codes or manually check in attendees
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
              connected
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            )}
          >
            <Wifi className="h-3.5 w-3.5" />
            {connected ? "Live" : "Offline"}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="card text-center">
          <p className="text-3xl font-bold text-gray-900">{stats.totalTickets}</p>
          <p className="text-sm text-gray-500">Total Tickets</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-green-600">{stats.checkedIn}</p>
          <p className="text-sm text-gray-500">Checked In</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-brand-600">{stats.checkInRate}%</p>
          <p className="text-sm text-gray-500">Check-In Rate</p>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* Scanner panel */}
        <div>
          {/* Mode toggle */}
          <div className="mb-4 flex gap-1 rounded-lg bg-gray-100 p-1">
            <button
              onClick={() => setMode("qr")}
              className={cn(
                "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                mode === "qr"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500"
              )}
            >
              <QrCode className="mr-1.5 inline h-4 w-4" />
              QR Scanner
            </button>
            <button
              onClick={() => setMode("manual")}
              className={cn(
                "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                mode === "manual"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500"
              )}
            >
              <UserPlus className="mr-1.5 inline h-4 w-4" />
              Manual
            </button>
          </div>

          {/* Result toast */}
          {lastResult && (
            <div
              className={cn(
                "mb-4 flex items-center gap-3 rounded-xl p-4 animate-slide-up",
                lastResult.success
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              )}
            >
              {lastResult.success ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600" />
              )}
              <div>
                <p
                  className={cn(
                    "font-medium",
                    lastResult.success ? "text-green-800" : "text-red-800"
                  )}
                >
                  {lastResult.message}
                </p>
                {lastResult.attendee && (
                  <p className="text-sm text-green-600">
                    {lastResult.attendee}
                  </p>
                )}
              </div>
            </div>
          )}

          {mode === "qr" ? (
            <QRScanner onScan={handleQRScan} scanning={scanning} />
          ) : (
            <form onSubmit={handleManualCheckIn} className="space-y-4">
              <div className="rounded-2xl border border-gray-200 bg-white p-6">
                <h3 className="text-sm font-semibold text-gray-900">
                  Manual Check-In
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Enter the attendee&apos;s user ID or search by email
                </p>
                <input
                  type="text"
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                  placeholder="User ID or email"
                  className="input mt-3"
                  required
                />
                <button
                  type="submit"
                  disabled={scanning}
                  className="btn-primary mt-3 w-full"
                >
                  {scanning ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Check In
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Check-in list */}
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Users className="h-5 w-5" />
            Check-In Log ({checkIns.length})
          </h2>
          <div className="mt-4 max-h-[600px] space-y-2 overflow-y-auto">
            {checkIns.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 py-12 text-center">
                <QrCode className="mx-auto h-10 w-10 text-gray-300" />
                <p className="mt-2 text-sm text-gray-500">
                  No check-ins yet. Start scanning!
                </p>
              </div>
            ) : (
              checkIns.map((checkIn, i) => (
                <div
                  key={checkIn.id || i}
                  className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 animate-fade-in"
                >
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {checkIn.attendee?.name || "Unknown"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {checkIn.attendee?.email} &middot;{" "}
                      {checkIn.method === "qr" ? "QR Scan" : "Manual"} &middot;{" "}
                      {formatRelative(checkIn.checkedInAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

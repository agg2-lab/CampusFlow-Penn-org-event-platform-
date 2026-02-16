export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo_url?: string;
  category?: string;
  role?: "admin" | "officer" | "member";
  created_at: string;
}

export interface Event {
  _id: string;
  title: string;
  slug: string;
  description: string;
  orgId: string;
  orgName: string;
  coverImage?: string;
  location: string;
  isVirtual: boolean;
  virtualLink?: string;
  startDate: string;
  endDate: string;
  tags: string[];
  capacity: number;
  rsvpCount: number;
  ticketPrice: number;
  isFree: boolean;
  isPublished: boolean;
  createdBy: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  eventId: string;
  qrCode: string;
  type: "free" | "paid";
  price: number;
}

export interface CheckIn {
  id: string;
  attendee?: { name: string; email: string };
  method: "qr" | "manual";
  checkedInAt: string;
}

export interface Membership {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  role: "admin" | "officer" | "member";
  joined_at: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface OrgDashboard {
  totalEvents: number;
  upcomingEvents: number;
  totalRSVPs: number;
  totalCheckIns: number;
  totalMembers: number;
  totalRevenue: number;
  checkInRate: number;
}

export interface EventAnalytics {
  event: { title: string; startDate: string };
  tickets: { total: number; active: number; used: number; cancelled: number };
  revenue: number;
  attendance: {
    rsvps: number;
    checkIns: number;
    dropOff: number;
    conversionRate: number;
    capacity: number;
    fillRate: number;
  };
  hourlyCheckIns: { hour: string; count: number }[];
}

export interface AttendanceTrend {
  eventId: string;
  title: string;
  date: string;
  rsvps: number;
  checkIns: number;
  checkInRate: number;
}

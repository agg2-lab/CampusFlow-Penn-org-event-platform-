"use client";

import Link from "next/link";
import {
  Calendar,
  Users,
  QrCode,
  BarChart3,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  Globe,
} from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Event Management",
    description:
      "Create and manage events with tickets, RSVPs, capacity limits, and virtual event support.",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: QrCode,
    title: "QR Check-In",
    description:
      "Real-time check-in with webcam QR scanning. Track attendance as it happens.",
    color: "bg-purple-100 text-purple-600",
  },
  {
    icon: Users,
    title: "Org Management",
    description:
      "Role-based access for admins, officers, and members. Manage your team effortlessly.",
    color: "bg-green-100 text-green-600",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Track attendance, drop-off rates, revenue, and conversions with beautiful charts.",
    color: "bg-amber-100 text-amber-600",
  },
  {
    icon: Sparkles,
    title: "Smart Recommendations",
    description:
      "Personalized event feed based on your interests and past attendance.",
    color: "bg-pink-100 text-pink-600",
  },
  {
    icon: Shield,
    title: "Secure Auth",
    description:
      "Sign in with Google OAuth or email magic links. No passwords to remember.",
    color: "bg-indigo-100 text-indigo-600",
  },
];

const stats = [
  { value: "500+", label: "Student Orgs" },
  { value: "10K+", label: "Events Created" },
  { value: "50K+", label: "Tickets Issued" },
  { value: "98%", label: "Check-In Success" },
];

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 pb-20 pt-20 text-white lg:pt-28">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 right-0 h-96 w-96 rounded-full bg-brand-600/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-brand-400/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
              <Zap className="h-4 w-4 text-yellow-400" />
              Built for Penn student organizations
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Your campus events,{" "}
              <span className="bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
                streamlined
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-lg text-blue-100/80">
              CampusFlow is the all-in-one platform for creating events, selling
              tickets, managing check-in, and growing your org. Built by students,
              for students.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-brand-900 shadow-lg transition-all hover:bg-blue-50 hover:shadow-xl active:scale-[0.98]"
              >
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/events"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-8 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
              >
                <Globe className="h-5 w-5" />
                Browse Events
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-20 grid max-w-3xl grid-cols-2 gap-8 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="mt-1 text-sm text-blue-200/70">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute -bottom-1 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 80L60 72C120 64 240 48 360 42.7C480 37 600 43 720 48C840 53 960 59 1080 56C1200 53 1320 43 1380 37.3L1440 32V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z"
              fill="#f9fafb"
            />
          </svg>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything your org needs
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              From event creation to post-event analytics, CampusFlow handles it
              all so you can focus on what matters.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="card group animate-fade-in"
              >
                <div
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.color} transition-transform group-hover:scale-110`}
                >
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 px-8 py-16 text-center shadow-2xl sm:px-16">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Ready to streamline your org?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-blue-100">
              Join hundreds of Penn student organizations already using CampusFlow
              to manage their events and grow their community.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-brand-700 shadow-lg transition-all hover:shadow-xl active:scale-[0.98]"
              >
                Create Your Org
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/events"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-8 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
              >
                Explore Events
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

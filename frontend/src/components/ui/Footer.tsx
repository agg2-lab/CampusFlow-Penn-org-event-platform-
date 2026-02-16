"use client";

import Link from "next/link";
import { Calendar } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
                <Calendar className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900">
                Campus<span className="text-brand-600">Flow</span>
              </span>
            </Link>
            <p className="mt-3 max-w-sm text-sm text-gray-500">
              The all-in-one platform for Penn student organizations. Create events,
              manage memberships, and build community.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Platform</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/events" className="text-sm text-gray-500 hover:text-gray-900">
                  Browse Events
                </Link>
              </li>
              <li>
                <Link href="/orgs" className="text-sm text-gray-500 hover:text-gray-900">
                  Organizations
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-sm text-gray-500 hover:text-gray-900">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">For Orgs</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/orgs/create" className="text-sm text-gray-500 hover:text-gray-900">
                  Register Org
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-900">
                  Analytics
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-200 pt-6">
          <p className="text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} CampusFlow. Built for Penn.
          </p>
        </div>
      </div>
    </footer>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, Users, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { Organization, Pagination } from "@/types";

export default function OrgsPage() {
  const { isAuthenticated } = useAuth();
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const fetchOrgs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "12");
      if (query) params.set("q", query);

      const data = await api.get<{
        organizations: Organization[];
        pagination: Pagination;
      }>(`/orgs?${params.toString()}`);
      setOrgs(data.organizations);
      setPagination(data.pagination);
    } catch (err) {
      console.error("Failed to fetch orgs:", err);
    } finally {
      setLoading(false);
    }
  }, [page, query]);

  useEffect(() => {
    fetchOrgs();
  }, [fetchOrgs]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Organizations</h1>
          <p className="section-subtitle">
            Discover and join student organizations
          </p>
        </div>
        {isAuthenticated && (
          <Link href="/orgs/create" className="btn-primary">
            <Plus className="h-4 w-4" />
            Create Org
          </Link>
        )}
      </div>

      {/* Search */}
      <div className="relative mt-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder="Search organizations..."
          className="input pl-10"
        />
      </div>

      {/* Orgs grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        </div>
      ) : orgs.length === 0 ? (
        <div className="py-20 text-center">
          <Users className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-3 text-lg text-gray-500">No organizations found</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {orgs.map((org) => (
            <Link key={org.id} href={`/orgs/${org.id}`}>
              <div className="card group cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                    {org.logo_url ? (
                      <img
                        src={org.logo_url}
                        alt={org.name}
                        className="h-14 w-14 rounded-xl object-cover"
                      />
                    ) : (
                      <Users className="h-7 w-7" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-lg font-semibold text-gray-900 group-hover:text-brand-600">
                      {org.name}
                    </h3>
                    {org.category && (
                      <span className="badge-gray mt-1">{org.category}</span>
                    )}
                  </div>
                </div>
                {org.description && (
                  <p className="mt-3 line-clamp-2 text-sm text-gray-500">
                    {org.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-secondary"
          >
            Previous
          </button>
          <span className="px-4 text-sm text-gray-600">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() =>
              setPage((p) => Math.min(pagination.totalPages, p + 1))
            }
            disabled={page === pagination.totalPages}
            className="btn-secondary"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

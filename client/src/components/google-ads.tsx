// client/src/components/google-ads.tsx
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

// Adjust to match your real payload
export interface GoogleAd {
  id: string;
  headline: string;
  description?: string;
  status: "active" | "paused" | "draft" | "disapproved";
  createdAt: string; // ISO date string
  // add any other fields your API returns (e.g., campaign, adGroup, cpc, impressions, clicks)
}

export function GoogleAds() {
  const [activeFilter, setActiveFilter] = useState<"all" | GoogleAd["status"]>("all");
  const [search, setSearch] = useState("");

  // ✅ Typed query; do NOT destructure data as `ads = []` (that’s what causes 'unknown')
  const query = useQuery<GoogleAd[]>({
    queryKey: ["/api/google-ads"],
    queryFn: async () => {
      const res = await fetch("/api/google-ads");
      if (!res.ok) return [];
      return (await res.json()) as GoogleAd[];
    },
    refetchInterval: 30000,
  });

  const isLoading = query.isLoading;
  const error = query.error;
  const ads: GoogleAd[] = query.data ?? [];

  // Optional: simple client filtering
  const visibleAds = useMemo(() => {
    let list = ads;
    if (activeFilter !== "all") {
      list = list.filter(a => a.status === activeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        a =>
          a.headline.toLowerCase().includes(q) ||
          (a.description ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [ads, activeFilter, search]);

  return (
    <div className="p-4 border rounded">
      <h2 className="font-bold mb-3">Google Ads</h2>

      {/* Controls */}
      <div className="flex items-center gap-2 mb-4">
        <select
          className="border rounded px-2 py-1"
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value as typeof activeFilter)}
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="draft">Draft</option>
          <option value="disapproved">Disapproved</option>
        </select>

        <input
          type="text"
          className="border rounded px-2 py-1 flex-1"
          placeholder="Search headline or description…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* States */}
      {isLoading && <p>Loading ads…</p>}
      {error && <p className="text-red-500">Error loading ads</p>}

      {/* List */}
      {!isLoading && !error && (
        <>
          <p className="text-sm text-gray-600 mb-2">
            Showing {visibleAds.length} of {ads.length} total
          </p>
          {visibleAds.length === 0 ? (
            <p>No ads match your filters.</p>
          ) : (
            <ul className="space-y-2">
              {visibleAds.map((ad) => (
                <li
                  key={ad.id}
                  className="p-3 border rounded flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                >
                  <div>
                    <div className="font-medium">{ad.headline}</div>
                    {ad.description && (
                      <div className="text-sm text-gray-600">{ad.description}</div>
                    )}
                    <div className="text-xs text-gray-500">
                      Created {new Date(ad.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <span
                    className={
                      "text-xs px-2 py-1 rounded self-start sm:self-auto " +
                      (ad.status === "active"
                        ? "bg-green-100 text-green-700"
                        : ad.status === "paused"
                        ? "bg-yellow-100 text-yellow-700"
                        : ad.status === "draft"
                        ? "bg-gray-100 text-gray-700"
                        : "bg-red-100 text-red-700")
                    }
                  >
                    {ad.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

export default GoogleAds;

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

// Replace with your real model
interface FestivalSubmission {
  id: string;
  title: string;
  status: string;
  submittedAt: string;
  // add any other fields your API returns
}

export function FestivalTracker() {
  const [activeTab, setActiveTab] = useState<string>("all");

  // ✅ Fetch and type submissions
  const query = useQuery<FestivalSubmission[]>({
    queryKey: ["/api/festivals/submissions"],
    queryFn: async () => {
      const res = await fetch("/api/festivals/submissions");
      if (!res.ok) return [];
      return (await res.json()) as FestivalSubmission[];
    },
    refetchInterval: 30000,
  });

  const isLoading = query.isLoading;
  const error = query.error;
  const submissions: FestivalSubmission[] = query.data ?? [];

  // ✅ Safe to use array methods now
  const filteredSubmissions =
    activeTab === "all"
      ? submissions
      : submissions.filter(
          (submission: FestivalSubmission) => submission.status === activeTab
        );

  const submissionStats = {
    total: submissions.length,
    // add other stat fields here if needed
  };

  return (
    <div className="p-4 border rounded">
      <h2 className="font-bold mb-2">Festival Tracker</h2>

      {/* Tabs */}
      <div className="flex space-x-2 mb-4">
        <button
          className={activeTab === "all" ? "font-bold" : ""}
          onClick={() => setActiveTab("all")}
        >
          All
        </button>
        <button
          className={activeTab === "pending" ? "font-bold" : ""}
          onClick={() => setActiveTab("pending")}
        >
          Pending
        </button>
        <button
          className={activeTab === "accepted" ? "font-bold" : ""}
          onClick={() => setActiveTab("accepted")}
        >
          Accepted
        </button>
        <button
          className={activeTab === "rejected" ? "font-bold" : ""}
          onClick={() => setActiveTab("rejected")}
        >
          Rejected
        </button>
      </div>

      {/* Loading / error / list */}
      {isLoading && <p>Loading submissions…</p>}
      {error && <p className="text-red-500">Error loading submissions</p>}

      {!isLoading && !error && (
        <div>
          <p className="mb-2 text-sm text-gray-600">
            Total submissions: {submissionStats.total}
          </p>
          {filteredSubmissions.length > 0 ? (
            <ul className="space-y-2">
              {filteredSubmissions.map((s) => (
                <li
                  key={s.id}
                  className="p-2 border rounded flex justify-between"
                >
                  <span>{s.title}</span>
                  <span className="text-sm text-gray-500">{s.status}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No submissions match this filter.</p>
          )}
        </div>
      )}
    </div>
  );
}

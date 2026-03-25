"use client";
import React, { useState } from "react";
import axios from "axios";
import { baseURL} from "@/auth/auth";
import { FiTrash, FiX, FiMail } from "react-icons/fi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

// ---------- API ----------

const fetchSubscribers = ({ page = 1, search = "" } = {}) => {
  const params = new URLSearchParams({ page });
  if (search) params.append("search", search);
  return axios.get(`${baseURL}/subscribers/?${params}`).then(r => r.data);
};

const deleteSubscriber = (id) =>
  axios.delete(`${baseURL}/subscribers/${id}/`);

// ---------- MAIN COMPONENT ----------
const SubscriberList = () => {
  const queryClient = useQueryClient();
  const [search,         setSearch]         = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page,            setPage]            = useState(1);

  // Debounce search — wait 500ms after user stops typing before firing API
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  React.useEffect(() => { setPage(1); }, [debouncedSearch]);

  const { data: response, isLoading } = useQuery({
    queryKey: ["subscribers", page, debouncedSearch],
    queryFn:  () => fetchSubscribers({ page, search: debouncedSearch }),
    keepPreviousData: true,
  });

  const subscribers = response?.results ?? [];
  const totalCount  = response?.count   ?? 0;
  const hasNext     = !!response?.next;
  const hasPrev     = !!response?.previous;
  const pageSize    = 10;
  const totalPages  = Math.ceil(totalCount / pageSize);

  const deleteMutation = useMutation({
    mutationFn: deleteSubscriber,
    onSuccess: () => {
      queryClient.invalidateQueries(["subscribers"]);
      toast.success("Subscriber removed!");
    },
    onError: () => toast.error("Failed to remove subscriber."),
  });

  const handleDelete = (id) => {
    if (confirm("Remove this subscriber?")) deleteMutation.mutate(id);
  };

  return (
    <div className="bg-white dark:bg-boxdark rounded-lg shadow-sm p-6 border border-stroke dark:border-strokedark">

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold">Subscribers</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {totalCount} subscriber{totalCount !== 1 ? "s" : ""}
          </p>
        </div>
        <input
          type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by email..."
          className="border border-gray-300 dark:border-strokedark rounded-md px-3 h-10 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-meta-4 transition"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : subscribers.length === 0 ? (
        <p className="text-gray-400 text-sm">
          {totalCount === 0 ? "No subscribers yet." : "No subscribers match the search."}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-strokedark">
                <th className="text-left py-3 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">#</th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</th>
                <th className="text-right py-3 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-strokedark">
              {subscribers.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-meta-4 transition-colors">
                  <td className="py-3 px-3 text-gray-400 text-xs">
                    {(page - 1) * pageSize + index + 1}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <FiMail size={14} className="text-gray-400 shrink-0" />
                      <span className="text-gray-800 dark:text-white">{item.email}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deleteMutation.isPending}
                        className="text-gray-400 hover:text-red-500 p-1.5 rounded transition"
                        title="Remove subscriber"
                      >
                        <FiTrash size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-100 dark:border-strokedark">
          <p className="text-sm text-gray-400">
            Page {page} of {totalPages} — {totalCount} total
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!hasPrev}
              className="px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-strokedark text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-meta-4 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
              .reduce((acc, p, i, arr) => {
                if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "..." ? (
                  <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-3 py-1.5 text-sm rounded border transition
                      ${page === p
                        ? "bg-primary text-white border-primary"
                        : "border-gray-300 dark:border-strokedark text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-meta-4"}`}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={!hasNext}
              className="px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-strokedark text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-meta-4 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriberList;
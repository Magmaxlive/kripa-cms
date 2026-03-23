"use client";
import React, { useState } from "react";
import axios from "axios";
import { baseURL, authToken } from "@/auth/auth";
import { FiEye, FiEdit, FiX, FiExternalLink, FiDownload } from "react-icons/fi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

// ---------- API ----------
const authHeaders = { Authorization: `Bearer ${authToken}` };

const fetchApplications = ({ page = 1, status = "", search = "" } = {}) => {
  const params = new URLSearchParams({ page });
  if (status) params.append("status", status);
  if (search) params.append("search", search);
  return axios.get(`${baseURL}/job-applications/?${params}`, { headers: authHeaders }).then(r => r.data);
};
const updateStatus = ({ id, status }) => axios.patch(`${baseURL}/job-applications/${id}/`, { status }, { headers: authHeaders });

// ---------- CONSTANTS ----------
const STATUS_OPTIONS = [
  { value: "pending",    label: "Pending",    color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300" },
  { value: "reviewing",  label: "Reviewing",  color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"         },
  { value: "accepted",   label: "Accepted",   color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"     },
  { value: "rejected",   label: "Rejected",   color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"             },
];

const getStatusStyle = (status) =>
  STATUS_OPTIONS.find(o => o.value === status)?.color || "bg-gray-100 text-gray-600";

const getStatusLabel = (status) =>
  STATUS_OPTIONS.find(o => o.value === status)?.label || status;

// ---------- MODAL ----------
const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-2xl" }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" style={{ zIndex: 9999 }}>
      <div className={`bg-white dark:bg-boxdark rounded-lg shadow-2xl p-6 w-full ${maxWidth} max-h-[90vh] overflow-y-auto`} style={{ zIndex: 10000 }}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><FiX size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
};

// ---------- STATUS BADGE ----------
const StatusBadge = ({ status }) => (
  <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium capitalize ${getStatusStyle(status)}`}>
    {getStatusLabel(status)}
  </span>
);

// ---------- DETAIL FIELD ----------
const DetailField = ({ label, value, mono = false }) => (
  <div className="flex flex-col gap-1">
    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</p>
    <p className={`text-sm text-gray-800 dark:text-white ${mono ? "font-mono" : ""}`}>{value || "—"}</p>
  </div>
);

// ---------- VIEW MODAL ----------
const ViewModal = ({ isOpen, onClose, data, onEditStatus }) => {
  if (!data) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Application Details" maxWidth="max-w-2xl">
      <div className="flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
              {data.first_name} {data.last_name}
            </h4>
            <p className="text-sm text-gray-500 mt-0.5">{data.position}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <StatusBadge status={data.status} />
            <button
              onClick={() => onEditStatus(data)}
              className="flex items-center gap-1.5 text-xs text-primary border border-primary/30 hover:bg-primary/5 px-3 py-1.5 rounded-lg transition"
            >
              <FiEdit size={12} /> Update Status
            </button>
          </div>
        </div>

        <hr className="border-gray-200 dark:border-strokedark" />

        {/* Contact Info */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Contact</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DetailField label="Email" value={data.email} />
            <DetailField label="Phone" value={data.phone} />
          </div>
          {data.linkedin_url && (
            <div className="mt-3">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">LinkedIn</p>
              <a href={data.linkedin_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                {data.linkedin_url} <FiExternalLink size={12} />
              </a>
            </div>
          )}
        </div>

        <hr className="border-gray-200 dark:border-strokedark" />

        {/* Application Info */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Application</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DetailField label="Position" value={data.position} />
            <DetailField label="Applied At" value={data.applied_at ? new Date(data.applied_at).toLocaleString() : "—"} />
          </div>
        </div>

        {/* Resume */}
        {data.resume && (
          <>
            <hr className="border-gray-200 dark:border-strokedark" />
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Resume</p>
              <a href={data.resume} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary border border-primary/30 hover:bg-primary/5 px-3 py-2 rounded-lg transition">
                <FiDownload size={14} /> Download / View Resume
              </a>
            </div>
          </>
        )}

        {/* Cover Letter */}
        {data.cover_letter && (
          <>
            <hr className="border-gray-200 dark:border-strokedark" />
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Cover Letter</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed bg-gray-50 dark:bg-meta-4 rounded-lg p-4">
                {data.cover_letter}
              </p>
            </div>
          </>
        )}

      </div>
      <div className="flex justify-end mt-6">
        <button onClick={onClose} className="px-4 py-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 transition">Close</button>
      </div>
    </Modal>
  );
};

// ---------- EDIT STATUS MODAL ----------
const EditStatusModal = ({ isOpen, onClose, data }) => {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState(data?.status || "pending");

  React.useEffect(() => {
    setStatus(data?.status || "pending");
  }, [data, isOpen]);

  const mutation = useMutation({
    mutationFn: updateStatus,
    onSuccess: () => {
      queryClient.invalidateQueries(["job-applications"]);
      toast.success("Status updated successfully!");
      onClose();
    },
    onError: () => toast.error("Failed to update status."),
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Application Status" maxWidth="max-w-sm">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-gray-500">
          Updating status for <span className="font-medium text-gray-800 dark:text-white">{data?.first_name} {data?.last_name}</span>
        </p>
        <div className="flex flex-col gap-2">
          {STATUS_OPTIONS.map((opt) => (
            <label key={opt.value}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition
                ${status === opt.value
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 dark:border-strokedark hover:bg-gray-50 dark:hover:bg-meta-4"}`}>
              <input
                type="radio" name="status" value={opt.value}
                checked={status === opt.value}
                onChange={(e) => setStatus(e.target.value)}
                className="accent-primary"
              />
              <StatusBadge status={opt.value} />
            </label>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <button onClick={onClose} className="px-4 py-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 transition">Cancel</button>
        <button
          onClick={() => mutation.mutate({ id: data?.id, status })}
          disabled={mutation.isPending || status === data?.status}
          className="px-4 py-2 rounded bg-primary text-white hover:bg-opacity-90 transition disabled:opacity-60"
        >
          {mutation.isPending ? "Saving..." : "Update"}
        </button>
      </div>
    </Modal>
  );
};

// ---------- MAIN COMPONENT ----------
const JobApplicationsForm = () => {
  const [viewModalOpen,   setViewModalOpen]   = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selected,        setSelected]        = useState(null);
  const [statusFilter,    setStatusFilter]    = useState("all");
  const [search,          setSearch]          = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page,            setPage]            = useState(1);

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: response, isLoading } = useQuery({
    queryKey: ["job-applications", page, statusFilter, debouncedSearch],
    queryFn:  () => fetchApplications({ page, status: statusFilter === "all" ? "" : statusFilter, search: debouncedSearch }),
    keepPreviousData: true,
  });

  const applications = response?.results ?? [];
  const totalCount   = response?.count   ?? 0;
  const hasNext      = !!response?.next;
  const hasPrev      = !!response?.previous;
  const pageSize     = 10;
  const totalPages   = Math.ceil(totalCount / pageSize);

  React.useEffect(() => { setPage(1); }, [statusFilter, debouncedSearch]);

  const handleView = (item) => { setSelected(item); setViewModalOpen(true); };
  const handleEditStatus = (item) => { setSelected(item); setStatusModalOpen(true); setViewModalOpen(false); };

  return (
    <>
      <ViewModal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        data={selected}
        onEditStatus={handleEditStatus}
      />
      <EditStatusModal
        key={`status-${selected?.id}-${statusModalOpen}`}
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        data={selected}
      />

      <div className="bg-white dark:bg-boxdark rounded-lg shadow-sm p-6 border border-stroke dark:border-strokedark">

        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold">Job Applications</h2>
            <p className="text-sm text-gray-400 mt-0.5">{totalCount} total application{totalCount !== 1 ? "s" : ""}</p>
          </div>
          {/* Search */}
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, position..."
            className="border border-gray-300 dark:border-strokedark rounded-md px-3 h-10 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-meta-4 transition"
          />
        </div>

        {/* Status filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition
              ${statusFilter === "all" ? "bg-primary text-white border-primary" : "bg-white dark:bg-meta-4 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-strokedark hover:border-primary hover:text-primary"}`}>
            All
          </button>
          {STATUS_OPTIONS.map(opt => (
            <button key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition
                ${statusFilter === opt.value ? "bg-primary text-white border-primary" : "bg-white dark:bg-meta-4 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-strokedark hover:border-primary hover:text-primary"}`}>
              {opt.label}
            </button>
          ))}
        </div>

        {/* Table */}
        {isLoading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : applications.length === 0 ? (
          <p className="text-gray-400 text-sm">{totalCount === 0 ? "No applications yet." : "No applications match the filters."}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-strokedark">
                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Applicant</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Position</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Contact</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Applied</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-right py-3 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-strokedark">
                {applications.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-meta-4 transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-medium text-gray-800 dark:text-white">{item.first_name} {item.last_name}</p>
                    </td>
                    <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{item.position}</td>
                    <td className="py-3 px-3 text-gray-500 dark:text-gray-400">{item.email}</td>
                    <td className="py-3 px-3 text-gray-400 text-xs">
                      {item.applied_at ? new Date(item.applied_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleView(item)}
                          className="text-gray-500 hover:text-primary p-1.5 rounded transition" title="View details">
                          <FiEye size={15} />
                        </button>
                        <button onClick={() => handleEditStatus(item)}
                          className="text-gray-500 hover:text-blue-500 p-1.5 rounded transition" title="Update status">
                          <FiEdit size={15} />
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
    </>
  );
};

export default JobApplicationsForm;
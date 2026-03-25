"use client";
import React from "react";
import axios from "axios";
import { baseURL } from "@/auth/auth";
import { useQuery } from "@tanstack/react-query";
import {
  MessageSquare,
  Briefcase,
  Users,
  BookOpen,
  Info,
  Image,
  Zap,
  ExternalLink,
} from "lucide-react";

// ---------- API ----------
const fetchStats = async () => {
  const [enquiries, jobs, subscribers, blogs] = await Promise.all([
    axios.get(`${baseURL}/enquiries/?page=1`).then(r => r.data),
    axios.get(`${baseURL}/job-applications/?page=1`).then(r => r.data),
    axios.get(`${baseURL}/subscribers/?page=1`).then(r => r.data),
    axios.get(`${baseURL}/blogs/`).then(r => r.data),
  ]);
  return {
    enquiries:   enquiries?.count  ?? 0,
    jobs:        jobs?.count       ?? 0,
    subscribers: subscribers?.count ?? 0,
    blogs:       blogs?.length     ?? 0,
  };
};

// ---------- STAT CARD ----------
const StatCard = ({ icon: Icon, label, value, color, isLoading }) => (
  <div className="bg-white dark:bg-boxdark rounded-xl border-2 border-stroke dark:border-strokedark p-5 flex items-center gap-4">
    <div className="rounded-lg p-3 shrink-0" style={{ background: color + "18" }}>
      <Icon size={22} style={{ color }} strokeWidth={1.8} />
    </div>
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-500 mb-0.5">{label}</p>
      {isLoading ? (
        <div className="h-7 w-12 bg-gray-100 dark:bg-meta-4 rounded animate-pulse" />
      ) : (
        <p className="text-2xl font-semibold text-gray-800 dark:text-white leading-tight">{value}</p>
      )}
    </div>
  </div>
);

// ---------- NOTE ITEM ----------
const NoteItem = ({ icon: Icon, color, title, description, link, linkLabel }) => (
  <div className="flex flex-col items-center text-center gap-2 border-2 border-stroke dark:border-strokedark rounded-xl p-5">
    <div
      className="w-12 h-12 rounded-full flex items-center justify-center mb-1"
      style={{ background: color + "18" }}
    >
      <Icon size={22} style={{ color }} strokeWidth={1.8} />
    </div>
    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{title}</p>
    <p className="text-xs text-gray-500 dark:text-gray-500 leading-relaxed">{description}</p>
    {link && linkLabel && (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-xs font-semibold mt-1 underline underline-offset-2 hover:opacity-75 transition"
        style={{ color }}
      >
        {linkLabel}
        <ExternalLink size={11} />
      </a>
    )}
  </div>
);

// ---------- MAIN ----------
const DashboardHome = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn:  fetchStats,
  });

  const statCards = [
    { icon: MessageSquare, label: "Enquiries",        value: stats?.enquiries,   color: "#378ADD" },
    { icon: Briefcase,     label: "Job Applications", value: stats?.jobs,        color: "#1D9E75" },
    { icon: Users,         label: "Newsletter Subscribers",      value: stats?.subscribers, color: "#7F77DD" },
    { icon: BookOpen,      label: "Blog Posts",       value: stats?.blogs,       color: "#BA7517" },
  ];

  const notes = [
    {
      icon:      Info,
      color:     "#378ADD",
      title:     "Icons — use Lucide icon names",
      description:
        "All icon fields across the CMS accept Lucide icon names. For example: 'Phone', 'Mail', 'MapPin', 'ArrowRight'. Copy the exact name from the Lucide website.",
      link:      "https://lucide.dev/icons/",
      linkLabel: "Browse Lucide icons",
    },
    {
      icon:      Image,
      color:     "#BA7517",
      title:     "Images must be under 1 MB",
      description:
        "All uploaded images (banners, team photos, logos, blog covers) must not exceed 1 MB. Larger files slow down page load. Compress images before uploading.",
      link:      "https://tinypng.com",
      linkLabel: "Compress with TinyPNG",
    },
    {
      icon:      Zap,
      color:     "#1D9E75",
      title:     "Keep media optimised",
      description:
        "Use WebP or compressed JPEG/PNG formats. Recommended: banners 1920×600px, team photos 400×400px, logos 400×120px. Avoid raw camera uploads.",
      link:      "https://squoosh.app",
      linkLabel: "Optimise with Squoosh",
    },
  ];

  return (
    <div className="flex flex-col gap-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Welcome to Kripa Dashboard
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
          Here's a quick overview of your content and guidelines.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} isLoading={isLoading} />
        ))}
      </div>

      {/* Notes */}
      <div className="bg-white dark:bg-boxdark rounded-xl border border-stroke dark:border-strokedark p-6">
        <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-1">
          Please note
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
          Keep these guidelines in mind while managing content.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <NoteItem key={note.title} {...note} />
          ))}
        </div>
      </div>

    </div>
  );
};

export default DashboardHome;
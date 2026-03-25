"use client";
import React, { useState } from "react";
import { baseURL } from '@/auth/auth';
import { MdLock } from "react-icons/md";
import { FaUser } from "react-icons/fa";

export default function SigninWithPassword() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${baseURL}/auth/login/`, {
        method:      "POST",
        headers:     { "Content-Type": "application/json" },
        credentials: "include",
        body:        JSON.stringify(form),
      });

      if (res.ok) {
        document.cookie = "isLoggedIn=true; path=/; max-age=604800; SameSite=Lax; Secure";
        window.location.href = "/dashboard";
      } else {
        const data = await res.json();
        setError(data.error || "Invalid credentials Provided");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <p className="text-sm text-red-700 font-semibold my-4 text-center">{error}</p>
        <label className="mb-2.5 block font-medium text-dark dark:text-white">
          Email/Username
        </label>
        <div className="relative">
          <input
            onChange={e => setForm({ ...form, [e.target.name]: e.target.value })}
            type="text" placeholder="Enter email or username" name="username" required
            className="w-full rounded-lg border border-stroke bg-transparent py-[15px] pl-6 pr-11 font-medium text-dark outline-none focus:border-primary focus-visible:shadow-none dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
          />
          <span className="absolute right-4.5 top-1/2 -translate-y-1/2"><FaUser size={20} /></span>
        </div>
      </div>

      <div className="mb-5">
        <label className="mb-2.5 block font-medium text-dark dark:text-white">Password</label>
        <div className="relative">
          <input
            onChange={e => setForm({ ...form, [e.target.name]: e.target.value })}
            type="password" name="password" placeholder="Enter your password"
            autoComplete="current-password" required
            className="w-full rounded-lg border border-stroke bg-transparent py-[15px] pl-6 pr-11 font-medium text-dark outline-none focus:border-primary focus-visible:shadow-none dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
          />
          <span className="absolute right-4.5 top-1/2 -translate-y-1/2"><MdLock size={20} /></span>
        </div>
      </div>

      <div className="mb-4.5">
        {loading ? (
          <div className="flex w-full items-center justify-center">
            <div className="border-gray-300 h-10 w-10 animate-spin rounded-full border-8 border-t-blue-600" />
          </div>
        ) : (
          <button type="submit"
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#004539] p-4 font-medium text-white transition hover:bg-opacity-90">
            Sign In
          </button>
        )}
      </div>
    </form>
  );
}
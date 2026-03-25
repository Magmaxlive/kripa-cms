"use client";
import { useState } from "react";
import { baseURL } from "@/auth/auth";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const Field = ({ label, id, value, onChange, error, placeholder }) => (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} <span className="text-red-500">*</span>
      </label>
      <input
        id={id} type="password" value={value} onChange={onChange}
        placeholder={placeholder} autoComplete="off"
        className={`border h-11 w-full rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-meta-4 transition
          ${error ? "border-red-400 focus:ring-red-400" : "border-gray-300 dark:border-strokedark"}`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );

export default function ChangePasswordPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    current_password: "",
    new_password:     "",
    confirm_password: "",
  });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => {
    setForm(f => ({ ...f, [k]: e.target.value }));
    setErrors(ev => ({ ...ev, [k]: "", general: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = {};
    if (!form.current_password)                             err.current_password = "Required.";
    if (!form.new_password)                                 err.new_password     = "Required.";
    if (form.new_password.length < 8)                       err.new_password     = "Min 8 characters.";
    if (form.new_password !== form.confirm_password)        err.confirm_password = "Passwords do not match.";
    if (Object.keys(err).length) { setErrors(err); return; }

    setLoading(true);
    try {
      const res = await fetch(`${baseURL}/auth/change-password/`, {
        method:      "POST",
        headers:     { "Content-Type": "application/json" },
        credentials: "include",
        body:        JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Password changed successfully!");
        setForm({ current_password: "", new_password: "", confirm_password: "" });
        router.push("/dashboard/home-page");
      } else {
        setErrors({ general: data.error || "Failed to change password." });
      }
    } catch {
      setErrors({ general: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="bg-white dark:bg-boxdark rounded-xl border border-stroke dark:border-strokedark p-8">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">Change Password</h2>
        <p className="text-sm text-gray-400 mb-6">Update your account password below.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Field label="Current Password"  id="current_password" value={form.current_password} onChange={set("current_password")} error={errors.current_password} placeholder="Enter current password" />
          <Field label="New Password"      id="new_password"     value={form.new_password}     onChange={set("new_password")}     error={errors.new_password}     placeholder="Min 8 characters" />
          <Field label="Confirm Password"  id="confirm_password" value={form.confirm_password} onChange={set("confirm_password")} error={errors.confirm_password} placeholder="Repeat new password" />

          {errors.general && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
              {errors.general}
            </p>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-medium text-white bg-primary hover:bg-opacity-90 transition disabled:opacity-60">
            {loading ? "Saving..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
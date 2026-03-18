
"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { baseURL, authToken } from "@/auth/auth";
import Loader from "@/components/Loader/loader";

const StepSectionForm = () => {
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [exists, setExists] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${baseURL}/api/work-process-section/`);
            if (res.data && res.data.length > 0) {
                setFormData(res.data[0]);
                setExists(true);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage("");

        const data = new FormData();
        data.append("title", formData.title || "");

        try {
            const url = exists
                ? `${baseURL}/api/work-process-section/${formData.id}/`
                : `${baseURL}/api/work-process-section/`;

            const method = exists ? "patch" : "post";

            const res = await axios[method](url, data, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setFormData(res.data);
            setExists(true);
            setMessage("Section title updated successfully!");
        } catch (error) {
            console.error(error);
            setMessage("Failed to save.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="max-w-2xl mx-auto mb-8 border-b pb-8">
            <h2 className="text-xl font-semibold mb-6">Section Heading Settings</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-1 text-sm font-medium">Main Heading</label>
                    <textarea
                        value={formData.title || ""}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        className="w-full border border-stroke dark:border-strokedark rounded p-2 dark:bg-meta-4 focus:border-primary outline-none"
                        rows="2"
                        placeholder="Industries We&#10;Serve"
                    />
                    <p className="text-xs text-gray-500 mt-1">Use new line for line break</p>
                </div>

                {message && (
                    <p className={`text-sm ${message.includes("success") ? "text-green-500" : "text-red-500"}`}>
                        {message}
                    </p>
                )}

                <div className="flex justify-end mt-4">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-2 bg-primary text-white rounded hover:bg-opacity-90 disabled:opacity-50"
                    >
                        {submitting ? "Saving..." : "Save Heading"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default StepSectionForm;

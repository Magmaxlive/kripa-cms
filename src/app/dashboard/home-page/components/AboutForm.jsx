
"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { baseURL, authToken } from "@/auth/auth";
import Loader from "@/components/Loader/loader";

const AboutForm = () => {
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
            const res = await axios.get(`${baseURL}/api/about/`);
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

        // Validation
        if (!formData.heading || !formData.content) {
            setMessage("Heading and Content are required.");
            setSubmitting(false);
            return;
        }

        const data = new FormData();
        data.append("heading", formData.heading);
        data.append("content", formData.content);
        data.append("years_exp", formData.years_exp || "");
        data.append("exp_text", formData.exp_text || "");
        data.append("button_text", formData.button_text || "");
        data.append("button_link", formData.button_link || "");

        if (formData.image_file) {
            data.append("image", formData.image_file);
        }

        try {
            const url = exists
                ? `${baseURL}/api/about/${formData.id}/`
                : `${baseURL}/api/about/`;

            const method = exists ? "patch" : "post";

            const res = await axios[method](url, data, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setFormData(res.data);
            setExists(true);
            setMessage("About section updated successfully!");
        } catch (error) {
            console.error(error);
            setMessage("Failed to save.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, image_file: file });
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold mb-6">About Section</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-1 text-sm font-medium">Heading</label>
                    <input
                        type="text"
                        value={formData.heading || ""}
                        onChange={e => setFormData({ ...formData, heading: e.target.value })}
                        className="w-full border border-stroke dark:border-strokedark rounded p-2 dark:bg-meta-4 focus:border-primary outline-none"
                    />
                </div>
                <div>
                    <label className="block mb-1 text-sm font-medium">Content</label>
                    <textarea
                        value={formData.content || ""}
                        onChange={e => setFormData({ ...formData, content: e.target.value })}
                        className="w-full border border-stroke dark:border-strokedark rounded p-2 dark:bg-meta-4 focus:border-primary outline-none"
                        rows="6"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-1 text-sm font-medium">Button Text</label>
                        <input
                            type="text"
                            value={formData.button_text || ""}
                            onChange={e => setFormData({ ...formData, button_text: e.target.value })}
                            className="w-full border border-stroke dark:border-strokedark rounded p-2 dark:bg-meta-4 focus:border-primary outline-none"
                            placeholder="Schedule Engineering Consultation"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium">Button Link</label>
                        <input
                            type="text"
                            value={formData.button_link || ""}
                            onChange={e => setFormData({ ...formData, button_link: e.target.value })}
                            className="w-full border border-stroke dark:border-strokedark rounded p-2 dark:bg-meta-4 focus:border-primary outline-none"
                            placeholder="/contact"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-1 text-sm font-medium">Main Image</label>
                        <input type="file" onChange={handleFileChange} className="text-sm" />
                        {formData.image && typeof formData.image === 'string' && (
                            <div className="mt-2 text-xs">
                                Current: <a href={formData.image} target="_blank" className="text-primary truncate">{formData.image.split('/').pop()}</a>
                            </div>
                        )}
                    </div>
                    {/* Add years_exp fields if needed */}
                </div>

                {message && (
                    <p className={`text-sm ${message.includes("success") ? "text-green-500" : "text-red-500"}`}>
                        {message}
                    </p>
                )}

                <div className="flex justify-end mt-6">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-2 bg-primary text-white rounded hover:bg-opacity-90 disabled:opacity-50"
                    >
                        {submitting ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AboutForm;

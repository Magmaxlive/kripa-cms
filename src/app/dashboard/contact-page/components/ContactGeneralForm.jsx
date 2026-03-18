
"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { baseURL, authToken } from "@/auth/auth";
import Loader from "@/components/Loader/loader";

const ContactGeneralForm = () => {
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [exists, setExists] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${baseURL}/api/contact-page/`);
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

        try {
            const url = exists
                ? `${baseURL}/api/contact-page/${formData.id}/`
                : `${baseURL}/api/contact-page/`;
            const method = exists ? "patch" : "post";

            await axios[method](url, formData, {
                headers: { Authorization: `Bearer ${authToken}` }
            });

            setMessage("Saved successfully!");
            if (!exists) fetchData();
        } catch (error) {
            console.error(error);
            setMessage("Failed to save.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="bg-white dark:bg-boxdark rounded-lg shadow-default p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-lg font-semibold mb-2">Map Configuration</h3>
                <div>
                    <label className="block mb-2 text-sm font-medium">Google Maps Embed Code (Iframe)</label>
                    <textarea
                        className="w-full border rounded p-2 dark:bg-meta-4 font-mono text-sm"
                        rows="4"
                        value={formData.map_iframe || ""}
                        onChange={e => setFormData({ ...formData, map_iframe: e.target.value })}
                        placeholder='<iframe src="https://www.google.com/maps/embed?..."></iframe>'
                    />
                </div>

                <h3 className="text-lg font-semibold mb-2 mt-6">Contact Form Text</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-2 text-sm font-medium">Form Title</label>
                        <input
                            className="w-full border rounded p-2 dark:bg-meta-4"
                            value={formData.form_title || ""}
                            onChange={e => setFormData({ ...formData, form_title: e.target.value })}
                            placeholder="e.g. Send your message"
                        />
                    </div>
                </div>
                <div>
                    <label className="block mb-2 text-sm font-medium">Form Description</label>
                    <textarea
                        className="w-full border rounded p-2 dark:bg-meta-4"
                        rows="2"
                        value={formData.form_description || ""}
                        onChange={e => setFormData({ ...formData, form_description: e.target.value })}
                    />
                </div>

                {message && <p className="text-blue-500">{message}</p>}

                <div className="flex justify-end mt-4">
                    <button type="submit" disabled={submitting} className="px-6 py-2 bg-primary text-white rounded hover:bg-opacity-90">
                        {submitting ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ContactGeneralForm;

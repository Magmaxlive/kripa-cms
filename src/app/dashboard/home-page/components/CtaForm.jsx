
"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { baseURL, authToken } from "@/auth/auth";
import Loader from "@/components/Loader/loader";

const CtaForm = () => {
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
            const res = await axios.get(`${baseURL}/api/cta-section/`);
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
        data.append("left_title", formData.left_title || "");
        data.append("left_button_text", formData.left_button_text || "");
        data.append("left_button_link", formData.left_button_link || "");
        data.append("right_title", formData.right_title || "");

        if (formData.left_image_file) {
            data.append("left_image", formData.left_image_file);
        }
        if (formData.right_background_image_file) {
            data.append("right_background_image", formData.right_background_image_file);
        }


        try {
            const url = exists
                ? `${baseURL}/api/cta-section/${formData.id}/`
                : `${baseURL}/api/cta-section/`;

            const method = exists ? "patch" : "post";

            const res = await axios[method](url, data, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setFormData(res.data);
            setExists(true);
            setMessage("CTA section updated successfully!");
        } catch (error) {
            console.error(error);
            setMessage("Failed to save.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleFileChange = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, [`${field}_file`]: file });
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold mb-6">CTA Section</h2>

            <form onSubmit={handleSubmit} className="space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Side */}
                    <div className="border p-4 rounded bg-gray-50 dark:bg-meta-4 dark:border-strokedark">
                        <h3 className="font-semibold mb-4 border-b pb-2">Left Side Content</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block mb-1 text-sm font-medium">Left Title (Supports HTML)</label>
                                <input className="w-full border rounded p-2 dark:bg-boxdark" value={formData.left_title || ""} onChange={e => setFormData({ ...formData, left_title: e.target.value })} />
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium">Left Image</label>
                                <input type="file" onChange={e => handleFileChange(e, "left_image")} className="text-sm" />
                                {formData.left_image && typeof formData.left_image === 'string' && <p className="text-xs mt-1 truncate">Current: {formData.left_image.split('/').pop()}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block mb-1 text-sm font-medium">Button Text</label>
                                    <input className="w-full border rounded p-2 dark:bg-boxdark" value={formData.left_button_text || ""} onChange={e => setFormData({ ...formData, left_button_text: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block mb-1 text-sm font-medium">Button Link</label>
                                    <input className="w-full border rounded p-2 dark:bg-boxdark" value={formData.left_button_link || ""} onChange={e => setFormData({ ...formData, left_button_link: e.target.value })} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side */}
                    <div className="border p-4 rounded bg-gray-50 dark:bg-meta-4 dark:border-strokedark">
                        <h3 className="font-semibold mb-4 border-b pb-2">Right Side Content</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block mb-1 text-sm font-medium">Right Title (Supports HTML)</label>
                                <textarea className="w-full border rounded p-2 dark:bg-boxdark" rows="3" value={formData.right_title || ""} onChange={e => setFormData({ ...formData, right_title: e.target.value })} />
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium">Right Background Image</label>
                                <input type="file" onChange={e => handleFileChange(e, "right_background_image")} className="text-sm" />
                                {formData.right_background_image && typeof formData.right_background_image === 'string' && <p className="text-xs mt-1 truncate">Current: {formData.right_background_image.split('/').pop()}</p>}
                            </div>
                        </div>
                    </div>
                </div>

                {message && <p className="text-blue-500 text-center">{message}</p>}

                <div className="flex justify-end mt-6">
                    <button type="submit" disabled={submitting} className="px-6 py-2 bg-primary text-white rounded hover:bg-opacity-90">
                        {submitting ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CtaForm;

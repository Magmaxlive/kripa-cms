
"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { baseURL, authToken } from "@/auth/auth";
import Loader from "@/components/Loader/loader";
import { FaTrash, FaPlus } from "react-icons/fa";

const StoryForm = () => {
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [exists, setExists] = useState(false);
    const [points, setPoints] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${baseURL}/api/about-page/`);
            if (res.data && res.data.length > 0) {
                const data = res.data[0];
                setFormData(data);
                setExists(true);
                if (data.about_list) {
                    setPoints(data.about_list);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handlePointChange = (index, value) => {
        const newPoints = [...points];
        newPoints[index] = { text: value };
        setPoints(newPoints);
    };

    const addPoint = () => {
        setPoints([...points, { text: "" }]);
    };

    const removePoint = (index) => {
        const newPoints = points.filter((_, i) => i !== index);
        setPoints(newPoints);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage("");

        const data = new FormData();
        // Breadcrumb
        data.append("breadcrumb_title", formData.breadcrumb_title || "");
        data.append("breadcrumb_subtitle", formData.breadcrumb_subtitle || "");
        if (formData.breadcrumb_image_file) data.append("breadcrumb_image", formData.breadcrumb_image_file);

        // About Main
        data.append("about_title", formData.about_title || "");
        data.append("about_description", formData.about_description || "");
        if (formData.about_image_file) data.append("about_image", formData.about_image_file);
        data.append("about_list", JSON.stringify(points));

        // Section Titles (Genetic, Capability, Choose)
        data.append("genetic_title", formData.genetic_title || "");
        data.append("genetic_subtitle", formData.genetic_subtitle || "");
        if (formData.genetic_bg_image_file) data.append("genetic_bg_image", formData.genetic_bg_image_file);

        data.append("capability_title", formData.capability_title || "");
        data.append("capability_subtitle", formData.capability_subtitle || "");

        data.append("choose_title", formData.choose_title || "");
        data.append("choose_subtitle", formData.choose_subtitle || "");
        data.append("choose_description", formData.choose_description || "");
        if (formData.choose_bg_image_file) data.append("choose_bg_image", formData.choose_bg_image_file);
        data.append("support_phone", formData.support_phone || "");


        try {
            const url = exists
                ? `${baseURL}/api/about-page/${formData.id}/`
                : `${baseURL}/api/about-page/`;

            const method = exists ? "patch" : "post";

            const res = await axios[method](url, data, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setFormData(res.data);
            setExists(true);
            setMessage("About Page updated successfully!");
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
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Breadcrumb Section */}
            <div className="border-b pb-6">
                <h3 className="text-lg font-semibold mb-4">Breadcrumb Section</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-2 text-sm font-medium">Breadcrumb Title</label>
                        <input className="w-full border rounded p-2 dark:bg-meta-4" value={formData.breadcrumb_title || ""} onChange={e => setFormData({ ...formData, breadcrumb_title: e.target.value })} />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium">Breadcrumb Subtitle</label>
                        <input className="w-full border rounded p-2 dark:bg-meta-4" value={formData.breadcrumb_subtitle || ""} onChange={e => setFormData({ ...formData, breadcrumb_subtitle: e.target.value })} />
                    </div>
                    <div className="col-span-2">
                        <label className="block mb-2 text-sm font-medium">Breadcrumb Background Image</label>
                        <input type="file" onChange={e => handleFileChange(e, "breadcrumb_image")} className="text-sm" />
                        {formData.breadcrumb_image && typeof formData.breadcrumb_image === 'string' && <p className="text-xs mt-1 text-gray-500">Current: {formData.breadcrumb_image.split('/').pop()}</p>}
                    </div>
                </div>
            </div>

            {/* Main About Section */}
            <div className="border-b pb-6">
                <h3 className="text-lg font-semibold mb-4">Main About Section</h3>
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block mb-2 text-sm font-medium">Title (HTML Supported)</label>
                        <input className="w-full border rounded p-2 dark:bg-meta-4" value={formData.about_title || ""} onChange={e => setFormData({ ...formData, about_title: e.target.value })} />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium">Description</label>
                        <textarea className="w-full border rounded p-2 dark:bg-meta-4" rows="4" value={formData.about_description || ""} onChange={e => setFormData({ ...formData, about_description: e.target.value })} />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium">Main Image</label>
                        <input type="file" onChange={e => handleFileChange(e, "about_image")} className="text-sm" />
                        {formData.about_image && typeof formData.about_image === 'string' && <p className="text-xs mt-1 text-gray-500">Current: {formData.about_image.split('/').pop()}</p>}
                    </div>

                    {/* Bullet Points */}
                    <div>
                        <label className="block mb-2 text-sm font-medium">Bullet Points</label>
                        {points.map((point, index) => (
                            <div key={index} className="flex items-center gap-2 mb-2">
                                <input
                                    className="w-full border rounded p-2 dark:bg-meta-4"
                                    value={point.text || ""}
                                    onChange={e => handlePointChange(index, e.target.value)}
                                    placeholder="Enter bullet point text"
                                />
                                <button type="button" onClick={() => removePoint(index)} className="text-red-500 hover:text-red-700">
                                    <FaTrash />
                                </button>
                            </div>
                        ))}
                        <button type="button" onClick={addPoint} className="flex items-center gap-1 text-primary text-sm font-medium mt-2">
                            <FaPlus /> Add Point
                        </button>
                    </div>
                </div>
            </div>

            {/* Engineering DNA (Genetic) Titles */}
            <div className="border-b pb-6">
                <h3 className="text-lg font-semibold mb-4">Engineering DNA Section Titles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-2 text-sm font-medium">Section Title</label>
                        <input className="w-full border rounded p-2 dark:bg-meta-4" value={formData.genetic_title || ""} onChange={e => setFormData({ ...formData, genetic_title: e.target.value })} />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium">Subtitle</label>
                        <input className="w-full border rounded p-2 dark:bg-meta-4" value={formData.genetic_subtitle || ""} onChange={e => setFormData({ ...formData, genetic_subtitle: e.target.value })} />
                    </div>
                    <div className="col-span-2">
                        <label className="block mb-2 text-sm font-medium">Background Image</label>
                        <input type="file" onChange={e => handleFileChange(e, "genetic_bg_image")} className="text-sm" />
                        {formData.genetic_bg_image && typeof formData.genetic_bg_image === 'string' && <p className="text-xs mt-1 text-gray-500">Current: {formData.genetic_bg_image.split('/').pop()}</p>}
                    </div>
                </div>
            </div>

            {/* Capabilities Titles */}
            <div className="border-b pb-6">
                <h3 className="text-lg font-semibold mb-4">Capabilities Section Titles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-2 text-sm font-medium">Section Title</label>
                        <input className="w-full border rounded p-2 dark:bg-meta-4" value={formData.capability_title || ""} onChange={e => setFormData({ ...formData, capability_title: e.target.value })} />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium">Subtitle</label>
                        <input className="w-full border rounded p-2 dark:bg-meta-4" value={formData.capability_subtitle || ""} onChange={e => setFormData({ ...formData, capability_subtitle: e.target.value })} />
                    </div>
                </div>
            </div>

            {/* Choose Services Section */}
            <div className="border-b pb-6">
                <h3 className="text-lg font-semibold mb-4">Bottom Choose/Services Section</h3>
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block mb-2 text-sm font-medium">Title</label>
                        <input className="w-full border rounded p-2 dark:bg-meta-4" value={formData.choose_title || ""} onChange={e => setFormData({ ...formData, choose_title: e.target.value })} />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium">Subtitle</label>
                        <input className="w-full border rounded p-2 dark:bg-meta-4" value={formData.choose_subtitle || ""} onChange={e => setFormData({ ...formData, choose_subtitle: e.target.value })} />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium">Description</label>
                        <textarea className="w-full border rounded p-2 dark:bg-meta-4" rows="3" value={formData.choose_description || ""} onChange={e => setFormData({ ...formData, choose_description: e.target.value })} />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium">Support Phone</label>
                        <input className="w-full border rounded p-2 dark:bg-meta-4" value={formData.support_phone || ""} onChange={e => setFormData({ ...formData, support_phone: e.target.value })} />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium">Background Image</label>
                        <input type="file" onChange={e => handleFileChange(e, "choose_bg_image")} className="text-sm" />
                        {formData.choose_bg_image && typeof formData.choose_bg_image === 'string' && <p className="text-xs mt-1 text-gray-500">Current: {formData.choose_bg_image.split('/').pop()}</p>}
                    </div>
                </div>
            </div>

            {message && <p className="text-blue-500 text-center">{message}</p>}

            <div className="flex justify-end">
                <button type="submit" disabled={submitting} className="px-6 py-2 bg-primary text-white rounded hover:bg-opacity-90">
                    {submitting ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </form>
    );
};

export default StoryForm;

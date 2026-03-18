"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { baseURL } from "@/auth/auth";
import Loader from "@/components/Loader/loader";

const PageSettingsForm = ({ pageName, pageTitle }) => {
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [bannerId, setBannerId] = useState(null);

    useEffect(() => {
        fetchBanner();
    }, [pageName]);

    const fetchBanner = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${baseURL}/api/page-banners/`);
            const banner = res.data.find(b => b.page_name === pageName);
            if (banner) {
                setFormData(banner);
                setBannerId(banner.id);
            } else {
                setFormData({ page_name: pageName });
            }
        } catch (error) {
            console.error("Error fetching banner:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, banner_image_file: file });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const data = new FormData();
        data.append("page_name", pageName);
        data.append("title", formData.title || "");
        data.append("subtitle", formData.subtitle || "");
        data.append("heading", formData.heading || "");
        data.append("sub_heading", formData.sub_heading || "");
        data.append("description", formData.description || "");
        if (formData.banner_image_file) {
            data.append("banner_image", formData.banner_image_file);
        }

        try {
            const token = localStorage.getItem('access_token');
            const headers = {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            };

            if (bannerId) {
                await axios.patch(`${baseURL}/api/page-banners/${bannerId}/`, data, { headers });
            } else {
                await axios.post(`${baseURL}/api/page-banners/`, data, { headers });
                // Re-fetch to get the new ID
                await fetchBanner();
            }
            alert("Settings saved successfully!");
        } catch (error) {
            console.error(error);
            alert("Failed to save settings.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                    {pageTitle} Settings
                </h3>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="p-6.5">
                    <div className="mb-4.5">
                        <label className="mb-2.5 block text-black dark:text-white">
                            Page Title <span className="text-meta-1">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Enter page title"
                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                            value={formData.title || ""}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div className="mb-4.5">
                        <label className="mb-2.5 block text-black dark:text-white">
                            Page Subtitle
                        </label>
                        <input
                            type="text"
                            placeholder="Enter page subtitle"
                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                            value={formData.subtitle || ""}
                            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                        />
                    </div>

                    <div className="mb-4.5">
                        <label className="mb-2.5 block text-black dark:text-white">
                            Section Heading (under banner)
                        </label>
                        <input
                            type="text"
                            placeholder="Enter section heading"
                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                            value={formData.heading || ""}
                            onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
                        />
                    </div>

                    <div className="mb-4.5">
                        <label className="mb-2.5 block text-black dark:text-white">
                            Section Sub-heading
                        </label>
                        <input
                            type="text"
                            placeholder="Enter section sub-heading"
                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                            value={formData.sub_heading || ""}
                            onChange={(e) => setFormData({ ...formData, sub_heading: e.target.value })}
                        />
                    </div>

                    <div className="mb-4.5">
                        <label className="mb-2.5 block text-black dark:text-white">
                            Description
                        </label>
                        <textarea
                            rows={6}
                            placeholder="Enter page description"
                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                            value={formData.description || ""}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        ></textarea>
                    </div>

                    <div className="mb-4.5">
                        <label className="mb-2.5 block text-black dark:text-white">
                            Banner Image
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            className="w-full cursor-pointer rounded-lg border-[1.5px] border-stroke bg-transparent font-medium outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-whiter file:py-3 file:px-5 file:hover:bg-primary file:hover:bg-opacity-10 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:file:border-form-strokedark dark:file:bg-white/30 dark:file:text-white dark:focus:border-primary"
                            onChange={handleFileChange}
                        />
                        {formData.banner_image && typeof formData.banner_image === 'string' && (
                            <div className="mt-3">
                                <p className="mb-1 text-sm text-black dark:text-white">Current Banner:</p>
                                <img src={formData.banner_image} alt="Banner" className="h-40 w-auto rounded object-cover" />
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
                    >
                        {submitting ? "Saving..." : "Save Settings"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PageSettingsForm;

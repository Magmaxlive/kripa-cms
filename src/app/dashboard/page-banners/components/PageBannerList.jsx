
"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { baseURL } from "@/auth/auth";
import Loader from "@/components/Loader/loader";
import { FaEdit } from "react-icons/fa";

const PAGES = [
    { id: 'products', name: 'Products Page' },
    { id: 'applications', name: 'Applications Page' },
    { id: 'news', name: 'News Page' },
    { id: 'contact', name: 'Contact Page' },
    { id: 'service', name: 'Service Page' },
    { id: 'about', name: 'About Page' },
];

const PageBannerList = () => {
    const [banners, setBanners] = useState({});
    const [loading, setLoading] = useState(true);
    const [editingPage, setEditingPage] = useState(null);
    const [formData, setFormData] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${baseURL}/api/page-banners/`);
            // Convert array to object keyed by page_name for easier lookup
            const bannersMap = {};
            res.data.forEach(banner => {
                bannersMap[banner.page_name] = banner;
            });
            setBanners(bannersMap);
        } catch (error) {
            console.error("Error fetching banners:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (pageId) => {
        const existingBanner = banners[pageId];
        setEditingPage(pageId);
        setFormData(existingBanner || { page_name: pageId, title: "", subtitle: "" });
    };

    const handleClose = () => {
        setEditingPage(null);
        setFormData({});
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
        data.append("page_name", editingPage);
        data.append("title", formData.title || "");
        data.append("subtitle", formData.subtitle || "");
        //data.append("description", formData.description || "");
        data.append("heading", formData.heading || "");
        data.append("sub_heading", formData.sub_heading || "");

        if (editingPage === 'applications') {
            data.append("applications_heading", formData.applications_heading || "");
            data.append("applications_sub_heading", formData.applications_sub_heading || "");
            data.append("applications_tab_label", formData.applications_tab_label || "");
            data.append("case_studies_heading", formData.case_studies_heading || "");
            data.append("case_studies_sub_heading", formData.case_studies_sub_heading || "");
            data.append("case_studies_tab_label", formData.case_studies_tab_label || "");
        }

        if (formData.banner_image_file) {
            data.append("banner_image", formData.banner_image_file);
        }

        try {
            const token = localStorage.getItem('access_token');
            const existingId = banners[editingPage]?.id;
            if (existingId) {
                await axios.patch(`${baseURL}/api/page-banners/${existingId}/`, data, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                await axios.post(`${baseURL}/api/page-banners/`, data, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }
            await fetchBanners();
            handleClose();
        } catch (error) {
            console.error(error);
            alert("Failed to save banner.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="mx-auto max-w-7xl">
            <h2 className="text-2xl font-bold mb-6 text-black dark:text-white">Page Banners Management</h2>

            {editingPage ? (
                <div className="bg-white dark:bg-boxdark rounded-lg shadow-default p-6">
                    <h3 className="text-lg font-semibold mb-4">Edit {PAGES.find(p => p.id === editingPage)?.name} Banner</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block mb-2 text-sm font-medium">Page Title</label>
                            <input
                                className="w-full border rounded p-2 dark:bg-meta-4"
                                value={formData.title || ""}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g., Our Products"
                            />
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium">Page Subtitle</label>
                            <input
                                className="w-full border rounded p-2 dark:bg-meta-4"
                                value={formData.subtitle || ""}
                                onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                                placeholder="e.g., Explore our range"
                            />
                        </div>

                        <div className="pt-4 border-t">
                            <h4 className="font-semibold mb-3 text-sm text-gray-500 uppercase">Section Content (Under Banner)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block mb-2 text-sm font-medium">Section Heading</label>
                                    <input
                                        className="w-full border rounded p-2 dark:bg-meta-4"
                                        value={formData.heading || ""}
                                        onChange={e => setFormData({ ...formData, heading: e.target.value })}
                                        placeholder="Main heading for the section..."
                                    />
                                </div>
                                <div>
                                    <label className="block mb-2 text-sm font-medium">Section Sub-heading</label>
                                    <input
                                        className="w-full border rounded p-2 dark:bg-meta-4"
                                        value={formData.sub_heading || ""}
                                        onChange={e => setFormData({ ...formData, sub_heading: e.target.value })}
                                        placeholder="Subtitle above the heading..."
                                    />
                                </div>
                            </div>
                        </div>

                        {editingPage === 'applications' && (
                            <div className="bg-gray-50 dark:bg-meta-4 p-4 rounded mb-4 border dark:border-strokedark">
                                <h4 className="font-semibold mb-4 text-primary">Applications Page Tabs</h4>

                                <div className="mb-4">
                                    <h5 className="font-medium mb-2 text-sm">Target: "Applications" Tab</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block mb-1 text-xs text-gray-500">Tab Heading</label>
                                            <input
                                                className="w-full border rounded p-2 dark:bg-boxdark"
                                                value={formData.applications_heading || ""}
                                                onChange={e => setFormData({ ...formData, applications_heading: e.target.value })}
                                                placeholder="Override: Oil and gas applications"
                                            />
                                        </div>
                                        <div>
                                            <label className="block mb-1 text-xs text-gray-500">Tab Subtitle</label>
                                            <input
                                                className="w-full border rounded p-2 dark:bg-boxdark"
                                                value={formData.applications_sub_heading || ""}
                                                onChange={e => setFormData({ ...formData, applications_sub_heading: e.target.value })}
                                                placeholder="Override: OUR GRAVITEX APPLICATIONS"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block mb-1 text-xs text-gray-500">Tab Button Label</label>
                                            <input
                                                className="w-full border rounded p-2 dark:bg-boxdark"
                                                value={formData.applications_tab_label || ""}
                                                onChange={e => setFormData({ ...formData, applications_tab_label: e.target.value })}
                                                placeholder="Button Text: Applications"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h5 className="font-medium mb-2 text-sm">Target: "Case Studies" Tab</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block mb-1 text-xs text-gray-500">Tab Heading</label>
                                            <input
                                                className="w-full border rounded p-2 dark:bg-boxdark"
                                                value={formData.case_studies_heading || ""}
                                                onChange={e => setFormData({ ...formData, case_studies_heading: e.target.value })}
                                                placeholder="e.g. Explore our successful projects"
                                            />
                                        </div>
                                        <div>
                                            <label className="block mb-1 text-xs text-gray-500">Tab Subtitle</label>
                                            <input
                                                className="w-full border rounded p-2 dark:bg-boxdark"
                                                value={formData.case_studies_sub_heading || ""}
                                                onChange={e => setFormData({ ...formData, case_studies_sub_heading: e.target.value })}
                                                placeholder="e.g. CASE STUDIES"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block mb-1 text-xs text-gray-500">Tab Button Label</label>
                                            <input
                                                className="w-full border rounded p-2 dark:bg-boxdark"
                                                value={formData.case_studies_tab_label || ""}
                                                onChange={e => setFormData({ ...formData, case_studies_tab_label: e.target.value })}
                                                placeholder="Button Text: Case Studies"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* <div>
                            <label className="block mb-2 text-sm font-medium">Description</label>
                            <textarea
                                className="w-full border rounded p-2 dark:bg-meta-4"
                                value={formData.description || ""}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Page description..."
                                rows={4}
                            />
                        </div> */}
                        <div>
                            <label className="block mb-2 text-sm font-medium">Banner Background Image</label>
                            <input type="file" onChange={handleFileChange} className="text-sm" />
                            {formData.banner_image && typeof formData.banner_image === 'string' && (
                                <p className="text-xs mt-1 text-gray-500 truncate">Current: {formData.banner_image.split('/').pop()}</p>
                            )}
                        </div>
                        <div className="flex justify-end gap-3 mt-4">
                            <button type="button" onClick={handleClose} className="px-4 py-2 border rounded hover:bg-gray-100 dark:hover:bg-meta-4">Cancel</button>
                            <button type="submit" disabled={submitting} className="px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90">
                                {submitting ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {PAGES.map(page => {
                        const banner = banners[page.id];
                        return (
                            <div key={page.id} className="bg-white dark:bg-boxdark rounded-lg shadow p-4 border border-gray-200 dark:border-strokedark">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-semibold text-lg">{page.name}</h3>
                                    <button onClick={() => handleEdit(page.id)} className="text-primary hover:text-opacity-80">
                                        <FaEdit size={18} />
                                    </button>
                                </div>
                                {banner ? (
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        <p><strong>Title:</strong> {banner.title || "N/A"}</p>
                                        <p><strong>Subtitle:</strong> {banner.subtitle || "N/A"}</p>
                                        <p className="line-clamp-2"><strong>Desc:</strong> {banner.description || "N/A"}</p>
                                        {banner.banner_image && (
                                            <div className="mt-2 h-20 w-full overflow-hidden rounded bg-gray-100">
                                                <img src={banner.banner_image} alt="Banner" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 italic">Not configured yet.</p>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default PageBannerList;

"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { baseURL } from "@/auth/auth";
import Loader from "@/components/Loader/loader";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";

const SECTION_CHOICES = [
    { value: 'useful_link', label: 'Useful Link' },
    { value: 'product', label: 'Product Link' },
];

const FooterLinkList = () => {
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingLink, setEditingLink] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        url: "",
        section: "useful_link",
        order: 0
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchLinks();
    }, []);

    const fetchLinks = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${baseURL}/api/footer-links/`);
            setLinks(res.data.results || res.data || []);
        } catch (error) {
            console.error("Error fetching links:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (link = null) => {
        if (link) {
            setEditingLink(link);
            setFormData({
                title: link.title,
                url: link.url,
                section: link.section,
                order: link.order
            });
        } else {
            setEditingLink(null);
            setFormData({
                title: "",
                url: "",
                section: "useful_link",
                order: 0
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingLink(null);
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this link?")) return;
        try {
            const token = localStorage.getItem('access_token');
            await axios.delete(`${baseURL}/api/footer-links/${id}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchLinks();
        } catch (error) {
            console.error(error);
            alert("Failed to delete link.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        const token = localStorage.getItem('access_token');
        const headers = { Authorization: `Bearer ${token}` };

        try {
            if (editingLink) {
                await axios.patch(`${baseURL}/api/footer-links/${editingLink.id}/`, formData, { headers });
            } else {
                await axios.post(`${baseURL}/api/footer-links/`, formData, { headers });
            }
            fetchLinks();
            handleCloseModal();
        } catch (error) {
            console.error(error);
            alert("Failed to save link.");
        } finally {
            setSubmitting(false);
        }
    };

    const usefulLinks = links.filter(l => l.section === 'useful_link').sort((a, b) => a.order - b.order);
    const productLinks = links.filter(l => l.section === 'product').sort((a, b) => a.order - b.order);

    if (loading) return <Loader />;

    return (
        <div className="mx-auto max-w-7xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-black dark:text-white">Footer Links Manager</h2>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90"
                >
                    <FaPlus /> Add New Link
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Useful Links Column */}
                <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                    <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                        <h3 className="font-medium text-black dark:text-white">Useful Links</h3>
                    </div>
                    <div className="p-6.5">
                        {usefulLinks.length === 0 ? (
                            <p className="text-sm text-gray-500">No links added. Defaults will be shown.</p>
                        ) : (
                            <ul className="flex flex-col gap-3">
                                {usefulLinks.map(link => (
                                    <li key={link.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-meta-4 rounded">
                                        <div>
                                            <p className="font-semibold text-black dark:text-white">{link.title}</p>
                                            <p className="text-xs text-gray-500">{link.url}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleOpenModal(link)} className="text-primary hover:text-opacity-80"><FaEdit /></button>
                                            <button onClick={() => handleDelete(link.id)} className="text-red hover:text-opacity-80"><FaTrash /></button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Product Links Column */}
                <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                    <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                        <h3 className="font-medium text-black dark:text-white">Product Links</h3>
                    </div>
                    <div className="p-6.5">
                        {productLinks.length === 0 ? (
                            <p className="text-sm text-gray-500">No links added. Defaults will be shown.</p>
                        ) : (
                            <ul className="flex flex-col gap-3">
                                {productLinks.map(link => (
                                    <li key={link.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-meta-4 rounded">
                                        <div>
                                            <p className="font-semibold text-black dark:text-white">{link.title}</p>
                                            <p className="text-xs text-gray-500">{link.url}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleOpenModal(link)} className="text-primary hover:text-opacity-80"><FaEdit /></button>
                                            <button onClick={() => handleDelete(link.id)} className="text-red hover:text-opacity-80"><FaTrash /></button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-999 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-full max-w-lg rounded-lg bg-white p-8 dark:bg-boxdark">
                        <h3 className="mb-6 text-xl font-bold text-black dark:text-white">
                            {editingLink ? "Edit Link" : "Add New Link"}
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="mb-2.5 block text-black dark:text-white">Section</label>
                                <select
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input"
                                    value={formData.section}
                                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                                >
                                    {SECTION_CHOICES.map(c => (
                                        <option key={c.value} value={c.value}>{c.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="mb-2.5 block text-black dark:text-white">Title</label>
                                <input
                                    type="text"
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. About Us"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="mb-2.5 block text-black dark:text-white">URL</label>
                                <input
                                    type="text"
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input"
                                    required
                                    value={formData.url}
                                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                    placeholder="e.g. /about"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="mb-2.5 block text-black dark:text-white">Order</label>
                                <input
                                    type="number"
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input"
                                    value={formData.order}
                                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 border rounded hover:bg-gray-100 dark:hover:bg-meta-4"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90"
                                >
                                    {submitting ? "Saving..." : "Save"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FooterLinkList;

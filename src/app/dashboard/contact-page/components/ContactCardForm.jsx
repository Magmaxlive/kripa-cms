
"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { baseURL, authToken } from "@/auth/auth";
import Loader from "@/components/Loader/loader";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";

const ContactCardForm = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${baseURL}/api/contact-info-cards/`);
            setItems(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData(item || { title: "", icon: "", content: "", delay: "0.3s" });
    };

    const handleClose = () => {
        setEditingItem(null);
        setFormData({});
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure?")) return;
        try {
            await axios.delete(`${baseURL}/api/contact-info-cards/${id}/`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (editingItem && editingItem.id) {
                await axios.patch(`${baseURL}/api/contact-info-cards/${editingItem.id}/`, formData, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
            } else {
                await axios.post(`${baseURL}/api/contact-info-cards/`, formData, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
            }
            fetchData();
            handleClose();
        } catch (error) {
            console.error(error);
            alert("Failed to save.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="space-y-6">
            {!editingItem && (
                <button
                    onClick={() => handleEdit({})}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90"
                >
                    <FaPlus /> Add New Card
                </button>
            )}

            {editingItem ? (
                <div className="bg-white dark:bg-boxdark rounded-lg shadow-default p-6">
                    <h3 className="text-lg font-semibold mb-4">{editingItem.id ? "Edit Card" : "New Card"}</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-2 text-sm font-medium">Title</label>
                                <input
                                    className="w-full border rounded p-2 dark:bg-meta-4"
                                    value={formData.title || ""}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium">Icon Name (React Icons)</label>
                                <input
                                    className="w-full border rounded p-2 dark:bg-meta-4"
                                    value={formData.icon || ""}
                                    onChange={e => setFormData({ ...formData, icon: e.target.value })}
                                    placeholder="e.g. FaMapMarkerAlt"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium">Animation Delay</label>
                                <input
                                    className="w-full border rounded p-2 dark:bg-meta-4"
                                    value={formData.delay || "0.3s"}
                                    onChange={e => setFormData({ ...formData, delay: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium">Content (HTML allowed)</label>
                            <textarea
                                className="w-full border rounded p-2 dark:bg-meta-4"
                                rows="3"
                                value={formData.content || ""}
                                onChange={e => setFormData({ ...formData, content: e.target.value })}
                                placeholder="Address, Email links, etc."
                            />
                        </div>
                        <div className="flex justify-end gap-3 mt-4">
                            <button type="button" onClick={handleClose} className="px-4 py-2 border rounded hover:bg-gray-100">Cancel</button>
                            <button type="submit" disabled={submitting} className="px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90">
                                {submitting ? "Saving..." : "Save Card"}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {items.map(item => (
                        <div key={item.id} className="bg-white dark:bg-boxdark rounded shadow p-4 border border-gray-200 dark:border-strokedark">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold text-lg">{item.title}</h4>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEdit(item)} className="text-primary hover:text-opacity-80"><FaEdit /></button>
                                    <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-opacity-80"><FaTrash /></button>
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 mb-2">Icon: {item.icon}</p>
                            <div className="text-gray-600 dark:text-gray-300 text-sm overflow-hidden" dangerouslySetInnerHTML={{ __html: item.content }} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ContactCardForm;

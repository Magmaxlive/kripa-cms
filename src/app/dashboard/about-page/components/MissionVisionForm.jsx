
"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { baseURL, authToken } from "@/auth/auth";
import Loader from "@/components/Loader/loader";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";

const MissionVisionForm = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingItem, setEditingItem] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${baseURL}/api/mission-vision/`);
            setItems(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure?")) return;
        try {
            await axios.delete(`${baseURL}/api/mission-vision/${id}/`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            fetchItems();
        } catch (error) {
            console.error(error);
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({ ...item });
        setIsFormOpen(true);
    };

    const handleAddNew = () => {
        setEditingItem(null);
        setFormData({});
        setIsFormOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const data = new FormData();
        data.append("title", formData.title || "");
        data.append("description", formData.description || "");
        data.append("icon_svg", formData.icon_svg || "");

        try {
            if (editingItem) {
                await axios.patch(`${baseURL}/api/mission-vision/${editingItem.id}/`, data, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
            } else {
                await axios.post(`${baseURL}/api/mission-vision/`, data, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
            }
            setIsFormOpen(false);
            fetchItems();
        } catch (error) {
            console.error(error);
            alert("Failed to save.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Mission & Vision Cards</h3>
                <button onClick={handleAddNew} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90">
                    <FaPlus /> Add New
                </button>
            </div>

            {isFormOpen && (
                <div className="mb-8 border p-4 rounded bg-gray-50 dark:bg-meta-4">
                    <h4 className="font-semibold mb-4">{editingItem ? "Edit Item" : "Add New Item"}</h4>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block mb-1 text-sm font-medium">Title</label>
                            <input className="w-full border rounded p-2" value={formData.title || ""} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                        </div>
                        <div>
                            <label className="block mb-1 text-sm font-medium">Description</label>
                            <textarea className="w-full border rounded p-2" rows="3" value={formData.description || ""} onChange={e => setFormData({ ...formData, description: e.target.value })} required />
                        </div>
                        <div>
                            <label className="block mb-1 text-sm font-medium">SVG Icon Code</label>
                            <textarea className="w-full border rounded p-2 font-mono text-xs" rows="4" value={formData.icon_svg || ""} onChange={e => setFormData({ ...formData, icon_svg: e.target.value })} placeholder="<svg ...>...</svg>" />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 border rounded hover:bg-gray-100">Cancel</button>
                            <button type="submit" disabled={submitting} className="px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90">{submitting ? "Saving..." : "Save"}</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map(item => (
                    <div key={item.id} className="border rounded p-4 dark:border-strokedark flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold">{item.title}</h4>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{item.description}</p>
                            {item.icon_svg && <div className="w-8 h-8 text-primary" dangerouslySetInnerHTML={{ __html: item.icon_svg }} />}
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => handleEdit(item)} className="text-blue-500 hover:text-blue-700"><FaEdit /></button>
                            <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700"><FaTrash /></button>
                        </div>
                    </div>
                ))}
                {items.length === 0 && <p className="text-gray-500 col-span-2 text-center">No items found.</p>}
            </div>
        </div>
    );
};

export default MissionVisionForm;

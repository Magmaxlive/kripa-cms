
"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { baseURL, authToken } from "@/auth/auth";
import Loader from "@/components/Loader/loader";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";

const ServiceForm = () => {
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
            const res = await axios.get(`${baseURL}/api/about-choose-items/`);
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
            await axios.delete(`${baseURL}/api/about-choose-items/${id}/`, {
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
        data.append("icon", formData.icon || "");

        try {
            if (editingItem) {
                await axios.patch(`${baseURL}/api/about-choose-items/${editingItem.id}/`, data, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
            } else {
                await axios.post(`${baseURL}/api/about-choose-items/`, data, {
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
                <h3 className="text-xl font-semibold">Service Items (Bottom List)</h3>
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
                            <label className="block mb-1 text-sm font-medium">Icon Class (e.g., flaticon-battery)</label>
                            <input className="w-full border rounded p-2" value={formData.icon || ""} onChange={e => setFormData({ ...formData, icon: e.target.value })} />
                            <p className="text-xs text-gray-500">Use Flaticon class names.</p>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 border rounded hover:bg-gray-100">Cancel</button>
                            <button type="submit" disabled={submitting} className="px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90">{submitting ? "Saving..." : "Save"}</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {items.map(item => (
                    <div key={item.id} className="border rounded p-4 dark:border-strokedark flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full text-primary">
                                <i className={item.icon}></i>
                            </span>
                            <h4 className="font-semibold text-sm">{item.title}</h4>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => handleEdit(item)} className="text-blue-500 hover:text-blue-700"><FaEdit /></button>
                            <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700"><FaTrash /></button>
                        </div>
                    </div>
                ))}
                {items.length === 0 && <p className="text-gray-500 col-span-4 text-center">No items found.</p>}
            </div>
        </div>
    );
};

export default ServiceForm;

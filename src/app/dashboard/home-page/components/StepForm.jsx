
"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { baseURL, authToken } from "@/auth/auth";
import Loader from "@/components/Loader/loader";
import { FiEdit, FiTrash, FiPlus } from "react-icons/fi";

import StepSectionForm from "./StepSectionForm";

const StepForm = () => {
    const [steps, setSteps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState("list");
    const [formData, setFormData] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${baseURL}/api/work-process/`);
            setSteps(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item) => {
        setFormData(item);
        setView("edit");
        setMessage("");
    };

    const handleCreate = () => {
        setFormData({});
        setView("create");
        setMessage("");
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure?")) return;
        try {
            await axios.delete(`${baseURL}/api/work-process/${id}/`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            fetchData();
        } catch (error) {
            console.error(error);
            alert("Failed to delete");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage("");

        const data = new FormData();
        data.append("title", formData.title || "");
        data.append("step_number", formData.step_number || "");
        data.append("description", formData.description || "");
        data.append("icon_name", formData.icon_name || "");

        try {
            const url = view === "create"
                ? `${baseURL}/api/work-process/`
                : `${baseURL}/api/work-process/${formData.id}/`;

            const method = view === "create" ? "post" : "patch";

            await axios[method](url, data, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setView("list");
            fetchData();
        } catch (error) {
            console.error(error);
            setMessage("Failed to save.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Loader />;

    if (view === "list") {
        return (
            <div>
                <StepSectionForm />
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Work Process Steps</h2>
                    <button onClick={handleCreate} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90">
                        <FiPlus /> Add New
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {steps.map((item) => (
                        <div key={item.id} className="border p-4 rounded bg-white dark:bg-boxdark relative">
                            <span className="absolute top-2 right-2 bg-gray-100 text-xs px-2 py-1 rounded">{item.step_number}</span>
                            <h3 className="font-semibold pr-8">{item.title}</h3>
                            <p className="text-xs text-gray-400 mb-2">Icon: {item.icon_name}</p>
                            <p className="text-sm text-gray-500 mb-2 line-clamp-3">{item.description}</p>
                            <div className="flex justify-end gap-2 text-primary mt-4">
                                <button onClick={() => handleEdit(item)}><FiEdit /></button>
                                <button onClick={() => handleDelete(item.id)} className="text-red-500"><FiTrash /></button>
                            </div>
                        </div>
                    ))}
                    {steps.length === 0 && <p className="text-gray-500">No steps found.</p>}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold mb-4">{view === "create" ? "Add Step" : "Edit Step"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Step Number</label>
                        <input className="w-full border rounded p-2 dark:bg-meta-4" value={formData.step_number || ""} onChange={e => setFormData({ ...formData, step_number: e.target.value })} placeholder="01" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">React Icon Name</label>
                        <input className="w-full border rounded p-2 dark:bg-meta-4" value={formData.icon_name || ""} onChange={e => setFormData({ ...formData, icon_name: e.target.value })} placeholder="FaShip" required />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input className="w-full border rounded p-2 dark:bg-meta-4" value={formData.title || ""} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea className="w-full border rounded p-2 dark:bg-meta-4" rows="3" value={formData.description || ""} onChange={e => setFormData({ ...formData, description: e.target.value })} required />
                </div>
                {message && <p className="text-red-500">{message}</p>}
                <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setView("list")} className="px-4 py-2 border rounded">Cancel</button>
                    <button type="submit" disabled={submitting} className="px-4 py-2 bg-primary text-white rounded">{submitting ? "Saving..." : "Save"}</button>
                </div>
            </form>
        </div>
    );
};

export default StepForm;

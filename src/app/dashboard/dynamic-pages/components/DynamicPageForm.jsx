"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { baseURL, authToken } from "@/auth/auth";
import Loader from "@/components/Loader/loader";
import { FaTrash, FaPlus } from "react-icons/fa";
import { useRouter } from "next/navigation";

const DynamicPageForm = ({ editSlug = null }) => {
    const router = useRouter();
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(!!editSlug);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");

    // JSON Lists
    const [points, setPoints] = useState([]); // About List
    const [missionList, setMissionList] = useState([]);
    const [geneticList, setGeneticList] = useState([]);
    const [capabilityList, setCapabilityList] = useState([]);
    const [chooseList, setChooseList] = useState([]);

    useEffect(() => {
        if (editSlug) fetchData();
    }, [editSlug]);

    const fetchData = async () => {
        try {
            const res = await axios.get(`${baseURL}/api/dynamic-pages/${editSlug}/`);
            const data = res.data;
            setFormData(data);
            if (data.about_list) setPoints(data.about_list);
            if (data.mission_list) setMissionList(data.mission_list);
            if (data.genetic_list) setGeneticList(data.genetic_list);
            if (data.capability_list) setCapabilityList(data.capability_list);
            if (data.choose_list) setChooseList(data.choose_list);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, [`${field}_file`]: file });
        }
    };

    // Generic List Handlers
    const addListItem = (list, setList, template) => setList([...list, template]);
    const removeListItem = (list, setList, index) => setList(list.filter((_, i) => i !== index));
    const updateListItem = (list, setList, index, field, value) => {
        const newList = [...list];
        newList[index] = { ...newList[index], [field]: value };
        setList(newList);
    };

    // Specific Point Handler
    const handlePointChange = (index, value) => {
        const newPoints = [...points];
        newPoints[index] = { text: value };
        setPoints(newPoints);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage("");

        const data = new FormData();
        // Basics
        data.append("name", formData.name || "");
        data.append("slug", formData.slug || "");

        // Breadcrumb
        data.append("breadcrumb_title", formData.breadcrumb_title || "");
        data.append("breadcrumb_subtitle", formData.breadcrumb_subtitle || "");
        if (formData.breadcrumb_image_file) data.append("breadcrumb_image", formData.breadcrumb_image_file);

        // About
        data.append("about_title", formData.about_title || "");
        data.append("about_description", formData.about_description || "");
        if (formData.about_image_file) data.append("about_image", formData.about_image_file);
        data.append("about_list", JSON.stringify(points));

        // Mission
        data.append("mission_list", JSON.stringify(missionList));

        // Genetic
        data.append("genetic_title", formData.genetic_title || "");
        data.append("genetic_subtitle", formData.genetic_subtitle || "");
        if (formData.genetic_bg_image_file) data.append("genetic_bg_image", formData.genetic_bg_image_file);
        data.append("genetic_list", JSON.stringify(geneticList));

        // Capability
        data.append("capability_title", formData.capability_title || "");
        data.append("capability_subtitle", formData.capability_subtitle || "");
        data.append("capability_list", JSON.stringify(capabilityList));

        // Choose
        data.append("choose_title", formData.choose_title || "");
        data.append("choose_subtitle", formData.choose_subtitle || "");
        data.append("choose_description", formData.choose_description || "");
        if (formData.choose_bg_image_file) data.append("choose_bg_image", formData.choose_bg_image_file);
        data.append("support_phone", formData.support_phone || "");
        data.append("choose_list", JSON.stringify(chooseList));

        try {
            const url = editSlug
                ? `${baseURL}/api/dynamic-pages/${editSlug}/`
                : `${baseURL}/api/dynamic-pages/`;
            const method = editSlug ? "patch" : "post";

            await axios[method](url, data, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setMessage("Page saved successfully!");
            setTimeout(() => router.push("/dashboard/dynamic-pages/view"), 1500);
        } catch (error) {
            console.error(error);
            setMessage("Failed to save page. Ensure slug is unique.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Loader />;

    const inputClass = "w-full border rounded p-2 dark:bg-meta-4 mb-2";
    const labelClass = "block mb-2 text-sm font-medium";

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="border-b pb-6">
                <h3 className="text-lg font-semibold mb-4">Page Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Page Name</label>
                        <input className={inputClass} value={formData.name || ""} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                    </div>
                    <div>
                        <label className={labelClass}>Slug (URL)</label>
                        <input className={inputClass} value={formData.slug || ""} onChange={e => setFormData({ ...formData, slug: e.target.value })} required />
                    </div>
                </div>
            </div>

            {/* Breadcrumb */}
            <div className="border-b pb-6">
                <h3 className="text-lg font-semibold mb-4">Breadcrumb</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className={labelClass}>Title</label><input className={inputClass} value={formData.breadcrumb_title || ""} onChange={e => setFormData({ ...formData, breadcrumb_title: e.target.value })} /></div>
                    <div><label className={labelClass}>Subtitle</label><input className={inputClass} value={formData.breadcrumb_subtitle || ""} onChange={e => setFormData({ ...formData, breadcrumb_subtitle: e.target.value })} /></div>
                    <div className="col-span-2">
                        <label className={labelClass}>Background Image</label>
                        <input type="file" onChange={e => handleFileChange(e, "breadcrumb_image")} />
                    </div>
                </div>
            </div>

            {/* About Main */}
            <div className="border-b pb-6">
                <h3 className="text-lg font-semibold mb-4">About Section</h3>
                <div className="grid grid-cols-1 gap-4">
                    <div><label className={labelClass}>Title</label><input className={inputClass} value={formData.about_title || ""} onChange={e => setFormData({ ...formData, about_title: e.target.value })} /></div>
                    <div><label className={labelClass}>Description</label><textarea className={inputClass} rows="3" value={formData.about_description || ""} onChange={e => setFormData({ ...formData, about_description: e.target.value })} /></div>
                    <div><label className={labelClass}>Image</label><input type="file" onChange={e => handleFileChange(e, "about_image")} /></div>

                    {/* Points */}
                    <div>
                        <label className={labelClass}>Bullet Points</label>
                        {points.map((p, i) => (
                            <div key={i} className="flex gap-2 mb-2"><input className={inputClass} value={p.text || ""} onChange={e => handlePointChange(i, e.target.value)} /><button type="button" onClick={() => setPoints(points.filter((_, idx) => idx !== i))}><FaTrash /></button></div>
                        ))}
                        <button type="button" onClick={() => setPoints([...points, { text: "" }])}><FaPlus /> Add Point</button>
                    </div>
                </div>
            </div>

            {/* Mission List */}
            <div className="border-b pb-6">
                <h3 className="text-lg font-semibold mb-4">Mission/Vision Cards</h3>
                {missionList.map((item, i) => (
                    <div key={i} className="border p-4 mb-2 rounded bg-gray-50 dark:bg-meta-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <input placeholder="Title" className={inputClass} value={item.title || ""} onChange={e => updateListItem(missionList, setMissionList, i, "title", e.target.value)} />
                            <input placeholder="Icon SVG Code" className={inputClass} value={item.icon_svg || ""} onChange={e => updateListItem(missionList, setMissionList, i, "icon_svg", e.target.value)} />
                            <textarea placeholder="Description" className={`${inputClass} col-span-2`} value={item.description || ""} onChange={e => updateListItem(missionList, setMissionList, i, "description", e.target.value)} />
                        </div>
                        <button type="button" onClick={() => removeListItem(missionList, setMissionList, i)} className="text-red-500"><FaTrash /> Remove</button>
                    </div>
                ))}
                <button type="button" onClick={() => addListItem(missionList, setMissionList, { title: "", description: "", icon_svg: "" })}><FaPlus /> Add Card</button>
            </div>

            {/* Genetic Section */}
            <div className="border-b pb-6">
                <h3 className="text-lg font-semibold mb-4">Engineering DNA</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div><label className={labelClass}>Title</label><input className={inputClass} value={formData.genetic_title || ""} onChange={e => setFormData({ ...formData, genetic_title: e.target.value })} /></div>
                    <div><label className={labelClass}>Subtitle</label><input className={inputClass} value={formData.genetic_subtitle || ""} onChange={e => setFormData({ ...formData, genetic_subtitle: e.target.value })} /></div>
                    <div><label className={labelClass}>Background Image</label><input type="file" onChange={e => handleFileChange(e, "genetic_bg_image")} /></div>
                </div>
                {geneticList.map((item, i) => (
                    <div key={i} className="border p-4 mb-2 rounded bg-gray-50 dark:bg-meta-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <input placeholder="Title" className={inputClass} value={item.title || ""} onChange={e => updateListItem(geneticList, setGeneticList, i, "title", e.target.value)} />
                            <input placeholder="Icon Class (Flaticon)" className={inputClass} value={item.icon || ""} onChange={e => updateListItem(geneticList, setGeneticList, i, "icon", e.target.value)} />
                            <textarea placeholder="Description" className={`${inputClass} col-span-2`} value={item.description || ""} onChange={e => updateListItem(geneticList, setGeneticList, i, "description", e.target.value)} />
                        </div>
                        <button type="button" onClick={() => removeListItem(geneticList, setGeneticList, i)} className="text-red-500"><FaTrash /> Remove</button>
                    </div>
                ))}
                <button type="button" onClick={() => addListItem(geneticList, setGeneticList, { title: "", description: "", icon: "" })}><FaPlus /> Add DNA Item</button>
            </div>

            {/* Capabilities */}
            <div className="border-b pb-6">
                <h3 className="text-lg font-semibold mb-4">Capabilities</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div><label className={labelClass}>Title</label><input className={inputClass} value={formData.capability_title || ""} onChange={e => setFormData({ ...formData, capability_title: e.target.value })} /></div>
                    <div><label className={labelClass}>Subtitle</label><input className={inputClass} value={formData.capability_subtitle || ""} onChange={e => setFormData({ ...formData, capability_subtitle: e.target.value })} /></div>
                </div>
                {capabilityList.map((item, i) => (
                    <div key={i} className="border p-4 mb-2 rounded bg-gray-50 dark:bg-meta-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <input placeholder="Title" className={inputClass} value={item.title || ""} onChange={e => updateListItem(capabilityList, setCapabilityList, i, "title", e.target.value)} />
                            <input placeholder="Image URL" className={inputClass} value={item.image || ""} onChange={e => updateListItem(capabilityList, setCapabilityList, i, "image", e.target.value)} />
                            <textarea placeholder="Description" className={`${inputClass} col-span-2`} value={item.description || ""} onChange={e => updateListItem(capabilityList, setCapabilityList, i, "description", e.target.value)} />
                        </div>
                        <button type="button" onClick={() => removeListItem(capabilityList, setCapabilityList, i)} className="text-red-500"><FaTrash /> Remove</button>
                    </div>
                ))}
                <button type="button" onClick={() => addListItem(capabilityList, setCapabilityList, { title: "", description: "", image: "" })}><FaPlus /> Add Capability</button>
            </div>

            {/* Choose Section */}
            <div className="border-b pb-6">
                <h3 className="text-lg font-semibold mb-4">Choose / Services</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div><label className={labelClass}>Title</label><input className={inputClass} value={formData.choose_title || ""} onChange={e => setFormData({ ...formData, choose_title: e.target.value })} /></div>
                    <div><label className={labelClass}>Subtitle</label><input className={inputClass} value={formData.choose_subtitle || ""} onChange={e => setFormData({ ...formData, choose_subtitle: e.target.value })} /></div>
                    <div className="col-span-2"><textarea placeholder="Description" className={inputClass} value={formData.choose_description || ""} onChange={e => setFormData({ ...formData, choose_description: e.target.value })} /></div>
                    <div><label className={labelClass}>Support Phone</label><input className={inputClass} value={formData.support_phone || ""} onChange={e => setFormData({ ...formData, support_phone: e.target.value })} /></div>
                    <div><label className={labelClass}>Background Image</label><input type="file" onChange={e => handleFileChange(e, "choose_bg_image")} /></div>
                </div>
                {chooseList.map((item, i) => (
                    <div key={i} className="border p-4 mb-2 rounded bg-gray-50 dark:bg-meta-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <input placeholder="Title" className={inputClass} value={item.title || ""} onChange={e => updateListItem(chooseList, setChooseList, i, "title", e.target.value)} />
                            <input placeholder="Icon Class" className={inputClass} value={item.icon || ""} onChange={e => updateListItem(chooseList, setChooseList, i, "icon", e.target.value)} />
                        </div>
                        <button type="button" onClick={() => removeListItem(chooseList, setChooseList, i)} className="text-red-500"><FaTrash /> Remove</button>
                    </div>
                ))}
                <button type="button" onClick={() => addListItem(chooseList, setChooseList, { title: "", icon: "" })}><FaPlus /> Add Service Item</button>
            </div>

            {message && <p className="text-blue-500 text-center">{message}</p>}

            <div className="flex justify-end">
                <button type="submit" disabled={submitting} className="px-6 py-2 bg-primary text-white rounded hover:bg-opacity-90">
                    {submitting ? "Saving..." : "Save Page"}
                </button>
            </div>
        </form>
    );
};

export default DynamicPageForm;

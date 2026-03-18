
"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { baseURL, authToken } from "@/auth/auth";
import Loader from "@/components/Loader/loader";

const SettingsForm = () => {
    const [formData, setFormData] = useState({});
    const [socials, setSocials] = useState({ instagram: "", linkedin: "", youtube: "" });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [exists, setExists] = useState(false);

    // Header Dynamic Settings State
    const [navLinks, setNavLinks] = useState([{ label: "Home", link: "/" }]);
    const [headerSettings, setHeaderSettings] = useState({
        header_cta_text: "MAKE AN APPOINTMENT",
        header_cta_link: "/contact",
        header_icon_class: "flaticon-phone-call",
        header_icon_link: "",
        header_top_left_title: "",
        header_top_left_icon: "flaticon-pin",
        header_top_left_link: "",
        newsletter_heading: "Let's Build Safer Systems. Together"
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${baseURL}/api/general-settings/`);
            if (res.data && res.data.length > 0) {
                const data = res.data[0];
                setFormData(data);
                setExists(true);
                if (data.social_links) {
                    setSocials({ ...socials, ...data.social_links });
                }

                // Parse Navigation Links
                if (data.navigation_links) {
                    let links = data.navigation_links;
                    if (typeof links === 'string') {
                        try { links = JSON.parse(links); } catch (e) { }
                    }
                    if (Array.isArray(links)) setNavLinks(links);
                }

                // Set Header Settings
                setHeaderSettings({
                    header_cta_text: data.header_cta_text || "",
                    header_cta_link: data.header_cta_link || "",
                    header_icon_class: data.header_icon_class || "",
                    header_icon_link: data.header_icon_link || "",
                    header_top_left_title: data.header_top_left_title || "",
                    header_top_left_icon: data.header_top_left_icon || "",
                    header_top_left_link: data.header_top_left_link || "",
                    newsletter_heading: data.newsletter_heading || ""
                });
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
        data.append("site_title", formData.site_title || "");
        data.append("contact_email", formData.contact_email || "");
        data.append("phone", formData.phone || "");
        data.append("address", formData.address || "");
        data.append("footer_description", formData.footer_description || "");
        data.append("copyright_text", formData.copyright_text || "");
        data.append("social_links", JSON.stringify(socials));

        // Header Fields
        data.append("navigation_links", JSON.stringify(navLinks));
        data.append("header_cta_text", headerSettings.header_cta_text || "");
        data.append("header_cta_link", headerSettings.header_cta_link || "");
        data.append("header_icon_class", headerSettings.header_icon_class || "");
        data.append("header_icon_link", headerSettings.header_icon_link || "");
        data.append("header_top_left_title", headerSettings.header_top_left_title || "");
        data.append("header_top_left_icon", headerSettings.header_top_left_icon || "");
        data.append("header_top_left_link", headerSettings.header_top_left_link || "");
        data.append("newsletter_heading", headerSettings.newsletter_heading || "");

        if (formData.logo_file) data.append("logo", formData.logo_file);
        if (formData.favicon_file) data.append("favicon", formData.favicon_file);
        if (formData.technical_brochure_file) data.append("technical_brochure", formData.technical_brochure_file);
        if (formData.corporate_brochure_file) data.append("corporate_brochure", formData.corporate_brochure_file);

        try {
            const url = exists
                ? `${baseURL}/api/general-settings/${formData.id}/`
                : `${baseURL}/api/general-settings/`;

            const method = exists ? "patch" : "post";

            const res = await axios[method](url, data, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setFormData(res.data);
            setExists(true);
            setMessage("Settings updated successfully!");
        } catch (error) {
            console.error(error);
            setMessage("Failed to save settings.");
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

    // Navigation Link Handlers
    const handleNavLinkChange = (index, field, value) => {
        const updatedLinks = [...navLinks];
        updatedLinks[index][field] = value;
        setNavLinks(updatedLinks);
    };

    const addNavLink = () => {
        setNavLinks([...navLinks, { label: "", link: "" }]);
    };

    const removeNavLink = (index) => {
        const updatedLinks = [...navLinks];
        updatedLinks.splice(index, 1);
        setNavLinks(updatedLinks);
    };

    if (loading) return <Loader />;

    return (
        <div className="max-w-4xl mx-auto p-4 bg-white dark:bg-boxdark rounded shadow">

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* General Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block mb-2 text-sm font-medium">Site Title</label>
                        <input className="w-full border rounded p-2 dark:bg-meta-4" value={formData.site_title || ""} onChange={e => setFormData({ ...formData, site_title: e.target.value })} />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium">Contact Email</label>
                        <input className="w-full border rounded p-2 dark:bg-meta-4" value={formData.contact_email || ""} onChange={e => setFormData({ ...formData, contact_email: e.target.value })} />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium">Phone</label>
                        <input className="w-full border rounded p-2 dark:bg-meta-4" value={formData.phone || ""} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium">Copyright Text</label>
                        <input className="w-full border rounded p-2 dark:bg-meta-4" value={formData.copyright_text || ""} onChange={e => setFormData({ ...formData, copyright_text: e.target.value })} />
                    </div>
                </div>

                <div>
                    <label className="block mb-2 text-sm font-medium">Address</label>
                    <textarea className="w-full border rounded p-2 dark:bg-meta-4" rows="3" value={formData.address || ""} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                </div>

                <div>
                    <label className="block mb-2 text-sm font-medium">Footer Description</label>
                    <textarea className="w-full border rounded p-2 dark:bg-meta-4" rows="3" value={formData.footer_description || ""} onChange={e => setFormData({ ...formData, footer_description: e.target.value })} />
                </div>

                {/* Files */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-4">
                    <div>
                        <label className="block mb-2 text-sm font-medium">Logo</label>
                        <input type="file" onChange={e => handleFileChange(e, "logo")} className="text-sm" />
                        {formData.logo && typeof formData.logo === 'string' && <p className="text-xs mt-1 truncate">Current: {formData.logo.split('/').pop()}</p>}
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium">Favicon</label>
                        <input type="file" onChange={e => handleFileChange(e, "favicon")} className="text-sm" />
                        {formData.favicon && typeof formData.favicon === 'string' && <p className="text-xs mt-1 truncate">Current: {formData.favicon.split('/').pop()}</p>}
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium">Technical Brochure (PDF)</label>
                        <input type="file" onChange={e => handleFileChange(e, "technical_brochure")} className="text-sm" />
                        {formData.technical_brochure && typeof formData.technical_brochure === 'string' && <p className="text-xs mt-1 truncate">Current: {formData.technical_brochure.split('/').pop()}</p>}
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium">Corporate Brochure (PDF)</label>
                        <input type="file" onChange={e => handleFileChange(e, "corporate_brochure")} className="text-sm" />
                        {formData.corporate_brochure && typeof formData.corporate_brochure === 'string' && <p className="text-xs mt-1 truncate">Current: {formData.corporate_brochure.split('/').pop()}</p>}
                    </div>
                </div>

                {/* Social Links */}
                <div className="border-t pt-4">
                    <h3 className="font-semibold mb-4">Social Links</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block mb-2 text-sm font-medium">Instagram URL</label>
                            <input className="w-full border rounded p-2 dark:bg-meta-4" value={socials.instagram || ""} onChange={e => setSocials({ ...socials, instagram: e.target.value })} />
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium">LinkedIn URL</label>
                            <input className="w-full border rounded p-2 dark:bg-meta-4" value={socials.linkedin || ""} onChange={e => setSocials({ ...socials, linkedin: e.target.value })} />
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium">YouTube URL</label>
                            <input className="w-full border rounded p-2 dark:bg-meta-4" value={socials.youtube || ""} onChange={e => setSocials({ ...socials, youtube: e.target.value })} />
                        </div>
                    </div>
                </div>

                {/* Header Configuration Section */}
                <div className="border-t pt-4 mt-6">
                    <h3 className="font-semibold mb-4 text-lg">Header Configuration</h3>

                    {/* Navigation Menu Links */}
                    <div className="mb-6 p-4 border rounded bg-gray-50 dark:bg-meta-4">
                        <label className="block mb-2 text-sm font-medium mb-3">Navigation Menu Items</label>
                        {navLinks.map((link, index) => (
                            <div key={index} className="flex gap-2 mb-2 items-center">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        placeholder="Label (e.g. Home)"
                                        className="w-full border rounded p-2 text-sm"
                                        value={link.label}
                                        onChange={(e) => handleNavLinkChange(index, 'label', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        placeholder="Link (e.g. /about)"
                                        className="w-full border rounded p-2 text-sm"
                                        value={link.link}
                                        onChange={(e) => handleNavLinkChange(index, 'link', e.target.value)}
                                        required
                                    />
                                </div>
                                <button type="button" onClick={() => removeNavLink(index)} className="text-red-500 hover:text-red-700 px-2">
                                    X
                                </button>
                            </div>
                        ))}
                        <button type="button" onClick={addNavLink} className="mt-2 text-sm text-primary underline">
                            + Add Menu Item
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* CTA Button Settings */}
                        <div>
                            <h4 className="font-medium text-sm mb-2 text-gray-600 dark:text-gray-300">CTA Button (Header Right)</h4>
                            <div className="space-y-3">
                                <div>
                                    <label className="block mb-1 text-xs text-gray-500">Button Text</label>
                                    <input
                                        className="w-full border rounded p-2 dark:bg-meta-4"
                                        value={headerSettings.header_cta_text || ""}
                                        onChange={e => setHeaderSettings({ ...headerSettings, header_cta_text: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1 text-xs text-gray-500">Button Link</label>
                                    <input
                                        className="w-full border rounded p-2 dark:bg-meta-4"
                                        value={headerSettings.header_cta_link || ""}
                                        onChange={e => setHeaderSettings({ ...headerSettings, header_cta_link: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Contact Icon Settings */}
                        <div>
                            <h4 className="font-medium text-sm mb-2 text-gray-600 dark:text-gray-300">Contact Icon (Header Right)</h4>
                            <div className="space-y-3">
                                <div>
                                    <label className="block mb-1 text-xs text-gray-500">Icon Class (Flaticon/FontAwesome)</label>
                                    <input
                                        className="w-full border rounded p-2 dark:bg-meta-4"
                                        placeholder="e.g. flaticon-phone-call"
                                        value={headerSettings.header_icon_class || ""}
                                        onChange={e => setHeaderSettings({ ...headerSettings, header_icon_class: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1 text-xs text-gray-500">Icon Link / Action</label>
                                    <input
                                        className="w-full border rounded p-2 dark:bg-meta-4"
                                        placeholder="e.g. tel:+971..."
                                        value={headerSettings.header_icon_link || ""}
                                        onChange={e => setHeaderSettings({ ...headerSettings, header_icon_link: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Top Bar Left Item Settings */}
                        <div>
                            <h4 className="font-medium text-sm mb-2 text-gray-600 dark:text-gray-300">Top Bar Left Item (Address)</h4>
                            <div className="space-y-3">
                                <div>
                                    <label className="block mb-1 text-xs text-gray-500">Text Content</label>
                                    <input
                                        className="w-full border rounded p-2 dark:bg-meta-4"
                                        placeholder="e.g. W500B..."
                                        value={headerSettings.header_top_left_title || ""}
                                        onChange={e => setHeaderSettings({ ...headerSettings, header_top_left_title: e.target.value })}
                                    />
                                    <p className="text-[10px] text-gray-400">Leaves empty to use default Address</p>
                                </div>
                                <div>
                                    <label className="block mb-1 text-xs text-gray-500">Icon Class</label>
                                    <input
                                        className="w-full border rounded p-2 dark:bg-meta-4"
                                        placeholder="e.g. flaticon-pin"
                                        value={headerSettings.header_top_left_icon || ""}
                                        onChange={e => setHeaderSettings({ ...headerSettings, header_top_left_icon: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1 text-xs text-gray-500">Link URL</label>
                                    <input
                                        className="w-full border rounded p-2 dark:bg-meta-4"
                                        placeholder="e.g. https://maps..."
                                        value={headerSettings.header_top_left_link || ""}
                                        onChange={e => setHeaderSettings({ ...headerSettings, header_top_left_link: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Newsletter Configuration */}
                <div className="border-t pt-4 mt-6">
                    <h3 className="font-semibold mb-4 text-lg">Newsletter Section</h3>
                    <div>
                        <label className="block mb-1 text-sm font-medium">Newsletter Heading</label>
                        <input
                            className="w-full border rounded p-2 dark:bg-meta-4"
                            value={headerSettings.newsletter_heading || ""}
                            onChange={e => setHeaderSettings({ ...headerSettings, newsletter_heading: e.target.value })}
                            placeholder="Let's Build Safer Systems. Together"
                        />
                    </div>
                </div>

                {message && <p className="text-blue-500 text-center">{message}</p>}

                <div className="flex justify-end mt-6">
                    <button type="submit" disabled={submitting} className="px-6 py-2 bg-primary text-white rounded hover:bg-opacity-90">
                        {submitting ? "Saving..." : "Save Settings"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SettingsForm;

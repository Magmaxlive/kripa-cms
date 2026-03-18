"use client";
import React, { useEffect, useState } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import Link from "next/link";
import axios from "axios";
import { baseURL, authToken } from "@/auth/auth";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";

const DynamicPagesView = () => {
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = async () => {
        try {
            const res = await axios.get(`${baseURL}/api/dynamic-pages/`);
            setPages(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const deletePage = async (id) => {
        if (!confirm("Are you sure you want to delete this page?")) return;
        try {
            await axios.delete(`${baseURL}/api/dynamic-pages/${id}/`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            fetchPages();
        } catch (error) {
            console.error(error);
            alert("Failed to delete page");
        }
    };

    return (
        <DefaultLayout>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-title-md2 font-semibold text-black dark:text-white">
                    Dynamic Pages
                </h2>
                <Link
                    href="/dashboard/dynamic-pages/create"
                    className="inline-flex items-center justify-center rounded-md bg-primary px-10 py-4 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
                >
                    Create New Page
                </Link>
            </div>

            <div className="flex flex-col gap-10">
                <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-stroke-dark dark:bg-boxdark sm:px-7.5 xl:pb-1">
                    <div className="max-w-full overflow-x-auto">
                        <table className="w-full table-auto">
                            <thead>
                                <tr className="bg-gray-2 text-left dark:bg-meta-4">
                                    <th className="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                                        Page Name
                                    </th>
                                    <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                                        Slug
                                    </th>
                                    <th className="py-4 px-4 font-medium text-black dark:text-white">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="3" className="text-center py-5">Loading...</td></tr>
                                ) : pages.length === 0 ? (
                                    <tr><td colSpan="3" className="text-center py-5">No pages found</td></tr>
                                ) : (
                                    pages.map((page) => (
                                        <tr key={page.id}>
                                            <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                                                <h5 className="font-medium text-black dark:text-white">
                                                    {page.name}
                                                </h5>
                                            </td>
                                            <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                                <p className="text-black dark:text-white">
                                                    /{page.slug}
                                                </p>
                                            </td>
                                            <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                                <div className="flex items-center space-x-3.5">
                                                    <Link href={`/dashboard/dynamic-pages/edit/${page.slug}`} className="hover:text-primary">
                                                        <FaEdit size={18} />
                                                    </Link>
                                                    <button onClick={() => deletePage(page.slug)} className="hover:text-primary">
                                                        <FaTrash size={18} />
                                                    </button>
                                                    {/* Optional View Link */}
                                                    <a href={`http://localhost:3000/pages/${page.slug}`} target="_blank" className="hover:text-primary" rel="noreferrer">
                                                        <FaEye size={18} />
                                                    </a>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DefaultLayout>
    );
};

export default DynamicPagesView;

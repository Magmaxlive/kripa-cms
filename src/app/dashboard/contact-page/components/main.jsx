
"use client";
import React, { useState } from "react";
import ContactSectionForm from "./ContactGeneralForm";


const ContactPageManager = () => {
    const [activeTab, setActiveTab] = useState("general");

    return (
        <div className="mx-auto max-w-7xl">
            <h2 className="text-2xl font-bold mb-6 text-black dark:text-white">Contact Page Management</h2>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-strokedark pb-3 mb-6">
                <button
                    className={`px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200 ${activeTab === 'general'
                                ? "bg-primary text-white shadow-md"
                                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-meta-4"
                            }`}
                    onClick={() => setActiveTab('general')}
                >
                    Contact & Map Info
                </button>
               
            </div>

            {/* Content */}
            <div>
                {activeTab === 'general' && <ContactSectionForm />}
                
            </div>
        </div>
    );
};

export default ContactPageManager;


"use client";
import React, { useState } from "react";
import PrivacyPolicyForm from "./PrivacyPolicyForm";
import TermsForm from "./Terms";
import { Disclosure } from "@headlessui/react";
import DisclosureForm from "./Disclosure";
import ImportantForm from "./ImpForm";



const LegalDocManager = () => {
    const [activeTab, setActiveTab] = useState("privacy-policy");

    const tabs = [
        { id: "privacy-policy", label: "Privacy Policy" },
        { id: "terms-condtion", label: "Terms & Condition" },
        { id: "disclosure", label: "Disclosure Statement" },
        { id: "imp-information", label: "Important Information" },
        
    ];

    return (
        <div className="mx-auto max-w-7xl">
            <h2 className="text-2xl font-bold mb-6 text-black dark:text-white">Legal Docs Management</h2>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-strokedark mb-8 pb-3 overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200 ${activeTab === tab.id
                                ? "bg-primary text-white shadow-md"
                                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-meta-4"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div>
                {activeTab === "privacy-policy" && <PrivacyPolicyForm />}
                {activeTab === "terms-condtion" && <TermsForm />}
                {activeTab === "disclosure" && <DisclosureForm />}
                {activeTab === "imp-information" && <ImportantForm />}  
            </div>
        </div>
    );
};

export default LegalDocManager;

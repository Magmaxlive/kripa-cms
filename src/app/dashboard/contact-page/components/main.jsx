
"use client";
import React, { useState } from "react";
import ContactGeneralForm from "./ContactGeneralForm";
import ContactCardForm from "./ContactCardForm";

const ContactPageManager = () => {
    const [activeTab, setActiveTab] = useState("general");

    return (
        <div className="mx-auto max-w-7xl">
            <h2 className="text-2xl font-bold mb-6 text-black dark:text-white">Contact Page Management</h2>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-strokedark mb-6">
                <button
                    className={`py-2 px-4 font-medium text-sm focus:outline-none ${activeTab === 'general' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                    onClick={() => setActiveTab('general')}
                >
                    Map & Form Info
                </button>
                <button
                    className={`py-2 px-4 font-medium text-sm focus:outline-none ${activeTab === 'cards' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                    onClick={() => setActiveTab('cards')}
                >
                    Contact Info Cards
                </button>
            </div>

            {/* Content */}
            <div>
                {activeTab === 'general' && <ContactGeneralForm />}
                {activeTab === 'cards' && <ContactCardForm />}
            </div>
        </div>
    );
};

export default ContactPageManager;

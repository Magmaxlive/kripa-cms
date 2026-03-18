
"use client";
import React, { useState } from "react";
import StoryForm from "./StoryForm";
import MissionVisionForm from "./MissionVisionForm";
import GeneticForm from "./GeneticForm";
import CapabilityForm from "./CapabilityForm";
import ServiceForm from "./ServiceForm";

const AboutPageManager = () => {
    const [activeTab, setActiveTab] = useState("story");

    const tabs = [
        { id: "story", label: "Story & Breadcrumb" },
        { id: "mission", label: "Mission & Vision" },
        { id: "genetic", label: "Engineering DNA" },
        { id: "capabilities", label: "Capabilities" },
        { id: "services", label: "Services" },
    ];

    return (
        <div className="mx-auto max-w-7xl">
            <h2 className="text-2xl font-bold mb-6 text-black dark:text-white">About Page Management</h2>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-strokedark mb-8 overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-4 px-6 text-sm font-medium focus:outline-none whitespace-nowrap ${activeTab === tab.id
                                ? "border-b-2 border-primary text-primary"
                                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-boxdark rounded-lg shadow-default p-6">
                {activeTab === "story" && <StoryForm />}
                {activeTab === "mission" && <MissionVisionForm />}
                {activeTab === "genetic" && <GeneticForm />}
                {activeTab === "capabilities" && <CapabilityForm />}
                {activeTab === "services" && <ServiceForm />}
            </div>
        </div>
    );
};

export default AboutPageManager;


"use client";
import React, { useState } from "react";
import AboutFirstSectionForm from "./StoryForm";
import MissionVisionForm from "./MissionVisionForm";
import GeneticForm from "./GeneticForm";
import CapabilityForm from "./CapabilityForm";
import ServiceForm from "./ServiceForm";

const AboutPageManager = () => {
    const [activeTab, setActiveTab] = useState("first-section");

    const tabs = [
        { id: "first-section", label: "First Section" },
        { id: "mission", label: "Mission & Vision" },
        { id: "genetic", label: "Engineering DNA" },
        { id: "capabilities", label: "Capabilities" },
        { id: "services", label: "Services" },
    ];

    return (
        <div className="mx-auto max-w-7xl">
            <h2 className="text-2xl font-bold mb-6 text-black dark:text-white">About Page Management</h2>

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
                {activeTab === "first-section" && <AboutFirstSectionForm />}
                {activeTab === "mission" && <MissionVisionForm />}
                {activeTab === "genetic" && <GeneticForm />}
                {activeTab === "capabilities" && <CapabilityForm />}
                {activeTab === "services" && <ServiceForm />}
            </div>
        </div>
    );
};

export default AboutPageManager;


"use client";
import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import HeroForm from "./HeroForm";
import AboutForm from "./AboutForm";
import ServiceForm from "./ServiceForm";
import ChooseForm from "./ChooseForm";
import StepForm from "./StepForm";
import InsightsForm from "./VideoForm";
import TestimonialsForm from "./TestimonialsForm";
import CtaForm from "./CtaForm";
import Partners from "./Partners";
import AchivemenstForm from "./AchievmentsForm"

const HomePageManager = () => {
    const [activeTab, setActiveTab] = useState("hero");

    const tabs = [
        { id: "hero", label: "Hero" },
        { id: "lenders", label: "Lenders" },
        { id: "services", label: "Services" },
        { id: "choose-section", label: "Choose Area" },
        { id: "achievments", label: "Achievments" },
        { id: "video-section", label: "Insights" },
        { id: "testimonials", label: "Testimonials" },
    ];

    return (
        <>
            <Breadcrumb pageName="Home Page Management" />

            <div className="mb-6 flex flex-wrap gap-2 border-b border-stroke dark:border-strokedark pb-5">
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

            <div >
                {activeTab === "hero" && <HeroForm />}
                {activeTab === "lenders" && <Partners />}
                {activeTab === "achievments" && <AchivemenstForm/>} 
                {activeTab === "services" && <ServiceForm />}
                {activeTab === "choose-section" && <ChooseForm />}
                {activeTab === "video-section" && <InsightsForm />}
                {activeTab === "testimonials" && <TestimonialsForm />}
            </div>
        </>
    );
};

export default HomePageManager;

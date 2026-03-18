"use client";
import React from "react";
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import DynamicPageForm from "../../components/DynamicPageForm";

const EditDynamicPage = ({ params }) => {
    return (
        <DefaultLayout>
            <div className="mx-auto max-w-270">
                <div className="mb-6 flex gap-3 sm:items-center">
                    <h2 className="text-title-md2 font-semibold text-black dark:text-white">
                        Edit Page
                    </h2>
                </div>
                <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-stroke-dark dark:bg-boxdark sm:px-7.5 xl:pb-1">
                    <DynamicPageForm editSlug={params.slug} />
                </div>
            </div>
        </DefaultLayout>
    );
};

export default EditDynamicPage;

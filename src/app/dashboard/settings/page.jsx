import React from "react";
import SettingsForm from "./components/SettingsForm";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLaout";

const SettingsPage = () => {
    return (
        <DefaultLayout>
            <Breadcrumb pageName="General Settings" />
            <SettingsForm />
        </DefaultLayout>
    );
};

export default SettingsPage;

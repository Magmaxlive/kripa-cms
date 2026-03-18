
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import PageSettingsForm from "@/components/PageSettings/PageSettingsForm";

export const metadata = {
    title: "Applications Page Settings | Gravitex Dashboard",
    description: "Manage Applications Page Title and Banner",
};

const ApplicationsSettingsPage = () => {
    return (
        <DefaultLayout>
            <div className="mx-auto max-w-270">
                <PageSettingsForm pageName="applications" pageTitle="Applications Page" />
            </div>
        </DefaultLayout>
    )
}

export default ApplicationsSettingsPage;

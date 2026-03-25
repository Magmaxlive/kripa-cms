
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import CommunityForm from "./components/CommunityForm";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

export const metadata = {
    title: "Community page Management | Kripa Dashboard",
    description: "Manage Community page Content",
};

const ContactPage = () => {
    return (
        <DefaultLayout>
        <Breadcrumb pageName="Community Page Management" />
            <CommunityForm />
        </DefaultLayout>
    )
}

export default ContactPage;


import DefaultLayout from "@/components/Layouts/DefaultLaout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import ChangePasswordPage from "./components/form";

export const metadata = {
    title: "Change password | Kripa Dashboard",
    description: "Change password",
};

const ContactPage = () => {
    return (
        <DefaultLayout>
        <Breadcrumb pageName="Change Password" />
            <ChangePasswordPage />
        </DefaultLayout>
    )
}

export default ContactPage;

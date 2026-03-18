
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import ContactPageManager from "./components/main";

export const metadata = {
    title: "Contact Page Management | Gravitex Dashboard",
    description: "Manage Contact Page Content",
};

const ContactPage = () => {
    return (
        <DefaultLayout>
            <ContactPageManager />
        </DefaultLayout>
    )
}

export default ContactPage;

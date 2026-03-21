
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import GeneralFaqsForm from "./components/GeneralFaqForm";


export const metadata = {
    title: "Faq Page Management | Kripa Dashboard",
    description: "Manage Faqs",
};

const Page = () => {
    return (
        <DefaultLayout>
            <Breadcrumb pageName="Faq Page Management" />
            <GeneralFaqsForm/>
        </DefaultLayout>
    )
}

export default Page;

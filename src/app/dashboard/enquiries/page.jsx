
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import EnquiryFormList from "./components/EnquiryForm";


export const metadata = {
    title: "Enquiry Management | Kripa Dashboard",
    description: "Manage Enquiries",
};

const Page = () => {
    return (
        <DefaultLayout>
            <Breadcrumb pageName="Enquiry Management" />
            <EnquiryFormList/>
        </DefaultLayout>
    )
}

export default Page;

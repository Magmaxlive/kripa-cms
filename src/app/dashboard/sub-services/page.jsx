
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import ServicesForm from "./components/ServiceForm";


export const metadata = {
    title: "Sub service Management | Kripa Dashboard",
    description: "Manage Sub service Content",
};

const Page = () => {
    return (
        <DefaultLayout>
            <Breadcrumb pageName="Sub Services Management" />
            <ServicesForm/>
        </DefaultLayout>
    )
}

export default Page;

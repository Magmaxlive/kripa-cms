
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import HeaderForm from "./components/HeaderForm";


export const metadata = {
    title: "Header Management | Kripa Dashboard",
    description: "Manage Header Content",
};

const Page = () => {
    return (
        <DefaultLayout>
            <Breadcrumb pageName="Header Management" />
            <HeaderForm/>
        </DefaultLayout>
    )
}

export default Page;

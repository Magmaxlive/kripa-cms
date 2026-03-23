
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import FooterForm from "./components/FooterForm";


export const metadata = {
    title: "Footer Management | Kripa Dashboard",
    description: "Manage Footer Content",
};

const Page = () => {
    return (
        <DefaultLayout>
            <Breadcrumb pageName="Footer Management" />
            <FooterForm/>
        </DefaultLayout>
    )
}

export default Page;

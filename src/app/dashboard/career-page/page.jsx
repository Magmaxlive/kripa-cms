
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import CareerPageForm from "./components/CareerForm";


export const metadata = {
    title: "Career Page Management | Kripa Dashboard",
    description: "Manage Career",
};

const Page = () => {
    return (
        <DefaultLayout>
            <Breadcrumb pageName="Career Page Management" />
            <CareerPageForm/>
        </DefaultLayout>
    )
}

export default Page;

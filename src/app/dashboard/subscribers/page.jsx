
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import SubscriberList from "./components/SubscriberList";


export const metadata = {
    title: "Subscribers Management | Kripa Dashboard",
    description: "Subscribers Management",
};

const Page = () => {
    return (
        <DefaultLayout>
            <Breadcrumb pageName="Subscribers Management" />
            <SubscriberList/>
        </DefaultLayout>
    )
}

export default Page;

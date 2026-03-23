
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import JobApplicationsForm from "./components/applicationPage";


export const metadata = {
    title: "Job Applications Management | Kripa Dashboard",
    description: "Job Applications Management",
};

const Page = () => {
    return (
        <DefaultLayout>
            <Breadcrumb pageName="Job Applications Management" />
            <JobApplicationsForm/>
        </DefaultLayout>
    )
}

export default Page;

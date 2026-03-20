
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import ThemeForm from "./components/Themeform";



export const metadata = {
    title: "Theme Management | Kripa Dashboard",
    description: "Manage Theme",
};

const Page = () => {
    return (
        <DefaultLayout>
            <Breadcrumb pageName="Theme Management" />
            <ThemeForm/>
        </DefaultLayout>
    )
}

export default Page;

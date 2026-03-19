
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import BlogForm from "./components/BlogForm";


export const metadata = {
    title: "Blog Management | Kripa Dashboard",
    description: "Manage Blogs",
};

const Page = () => {
    return (
        <DefaultLayout>
            <Breadcrumb pageName="Blog Management" />
            <BlogForm/>
        </DefaultLayout>
    )
}

export default Page;


import DefaultLayout from "@/components/Layouts/DefaultLaout";
import AddBlog from "./components/main";


export const metadata = {
    title: "Gravitex CMS",
    description: "Gravitex",
};

const CreateAppointment = () => {

    return (
        <>
            <DefaultLayout>
                <AddBlog pageName="Add Blog / News" />
            </DefaultLayout>
        </>
    )
}

export default CreateAppointment;
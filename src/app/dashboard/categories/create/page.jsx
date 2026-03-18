
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import AddCategories from "./components/main";


export const metadata = {
    title: "Gravitex CMS",
    description: "Gravitex",
};

const CreateAppointment = () => {

    return (
        <>
            <DefaultLayout>
                <AddCategories pageName="Add Categories" />
            </DefaultLayout>
        </>
    )
}

export default CreateAppointment;
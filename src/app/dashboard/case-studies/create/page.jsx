
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import AddCaseStudies from "./components/main";


export const metadata = {
    title: "Gravitex CMS",
    description: "Gravitex",
};

const CreateAppointment = () => {

    return (
        <>
            <DefaultLayout>
                <AddCaseStudies pageName="Add Cases Studies" />
            </DefaultLayout>
        </>
    )
}

export default CreateAppointment;
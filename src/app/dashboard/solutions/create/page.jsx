
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import AddSolutions from "./components/main";


export const metadata = {
    title: "FBM Control Panel",
    description: "Fortune Business Management Limited",
};

const CreateAppointment = () => {

    return (
        <>
            <DefaultLayout>
                <AddSolutions pageName="Add Solutions" />
            </DefaultLayout>
        </>
    )
}

export default CreateAppointment;
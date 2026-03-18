
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import AddEvents from "./components/main";


export const metadata = {
    title: "FBM Control Panel",
    description: "Fortune Business Management Limited",
};

const CreateAppointment = () => {

    return (
        <>
            <DefaultLayout>
                <AddEvents pageName="Add Events" />
            </DefaultLayout>
        </>
    )
}

export default CreateAppointment;
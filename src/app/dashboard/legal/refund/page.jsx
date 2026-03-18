
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import AddRefund from "./components/main";


// export const metadata = {
//     title: "FBM Control Panel",
//     description: "Fortune Business Management Limited",
// };

const CreateRefundPolicy= () => {


    return (
        <>
            <DefaultLayout>
                <AddRefund pageName="Add Refund Policy" />
            </DefaultLayout>
        </>
    )
}

export default CreateRefundPolicy;
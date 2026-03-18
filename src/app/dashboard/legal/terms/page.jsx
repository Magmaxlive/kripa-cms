
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import AddTerms from "./components/main";


// export const metadata = {
//     title: "FBM Control Panel",
//     description: "Fortune Business Management Limited",
// };

const CreateTerms= () => {


    return (
        <>
            <DefaultLayout>
                <AddTerms pageName="Add Terms and Conditions" />
            </DefaultLayout>
        </>
    )
}

export default CreateTerms;
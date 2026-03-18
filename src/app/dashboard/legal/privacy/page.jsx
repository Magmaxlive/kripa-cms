
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import AddPrivacy from "./components/main";


// export const metadata = {
//     title: "FBM Control Panel",
//     description: "Fortune Business Management Limited",
// };

const CreatePrivacyPolicy = () => {


    return (
        <>
            <DefaultLayout>
                <AddPrivacy pageName="Add Privacy Policy" />
            </DefaultLayout>
        </>
    )
}

export default CreatePrivacyPolicy;
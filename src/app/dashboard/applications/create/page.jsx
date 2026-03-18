
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import AddPortfolio from "./components/main";


// export const metadata = {
//     title: "Magmax Control Panel",
//     description: "Fortune Business Management Limited",
// };

const CreatePortfolio = () => {

    return (
        <>
            <DefaultLayout>
                <AddPortfolio pageName={"Add Applications"}  />
            </DefaultLayout>
        </>
    )
}

export default CreatePortfolio;
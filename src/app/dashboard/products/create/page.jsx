
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import AddProducts from "./components/main";


// export const metadata = {
//     title: "Magmax Control Panel",
//     description: "Fortune Business Management Limited",
// };

const CreatePortfolio = () => {

    return (
        <>
            <DefaultLayout>
                <AddProducts pageName={"Add Products"}  />
            </DefaultLayout>
        </>
    )
}

export default CreatePortfolio;

import DefaultLayout from "@/components/Layouts/DefaultLaout";
import HomePageManager from "./components/main";

export const metadata = {
    title: "Home Page Management | Kripa Dashboard",
    description: "Manage Home Page Content",
};

const HomePage = () => {
    return (
        <DefaultLayout>
            <HomePageManager />
        </DefaultLayout>
    )
}

export default HomePage;

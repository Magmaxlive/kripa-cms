
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import AboutPageManager from "./components/main";

export const metadata = {
    title: "About Page Management | Gravitex Dashboard",
    description: "Manage About Page Content",
};

const AboutPage = () => {
    return (
        <DefaultLayout>
            <AboutPageManager />
        </DefaultLayout>
    )
}

export default AboutPage;

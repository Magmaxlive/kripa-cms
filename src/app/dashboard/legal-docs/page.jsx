
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import LegalDocManager from "./components/main";

export const metadata = {
    title: "Legal Docs Management | Kripa Dashboard",
    description: "Legal Docs Content",
};

const AboutPage = () => {
    return (
        <DefaultLayout>
            <LegalDocManager/>
        </DefaultLayout>
    )
}

export default AboutPage;

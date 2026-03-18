
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import FooterLinkList from "@/components/FooterLinks/FooterLinkList";

export const metadata = {
    title: "Footer Links Manager | Gravitex Dashboard",
    description: "Manage Useful Links and Product Links in Footer",
};

const FooterLinksPage = () => {
    return (
        <DefaultLayout>
            <FooterLinkList />
        </DefaultLayout>
    )
}

export default FooterLinksPage;

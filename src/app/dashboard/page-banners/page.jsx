
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import PageBannerList from "./components/PageBannerList";

export const metadata = {
    title: "Page Banners Management | Gravitex Dashboard",
    description: "Manage Page Headers/Banners",
};

const PageBannersPage = () => {
    return (
        <DefaultLayout>
            <PageBannerList />
        </DefaultLayout>
    )
}

export default PageBannersPage;

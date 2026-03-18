
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import PageSettingsForm from "@/components/PageSettings/PageSettingsForm";

export const metadata = {
    title: "Products Page Settings | Gravitex Dashboard",
    description: "Manage Products Page Banner and Description",
};

const ProductsSettingsPage = () => {
    return (
        <DefaultLayout>
            <div className="mx-auto max-w-270">
                <PageSettingsForm pageName="products" pageTitle="Products Page" />
            </div>
        </DefaultLayout>
    )
}

export default ProductsSettingsPage;

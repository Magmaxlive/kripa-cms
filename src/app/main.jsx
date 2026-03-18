"use client";
import ECommerce from "@/components/Dashboard/E-commerce";
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import { useRouter } from "next/navigation";
import { useEffect } from "react";


// Secure token check function
const secureTokenCheck = () => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("access_token");
        return !!token; // Returns true if token exists, false otherwise
    }
    return false;
};

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        const isAuthenticated = secureTokenCheck();
        
        if (!isAuthenticated) {
            // Redirect to login page with a return URL for post-login redirection
            const returnUrl = encodeURIComponent(window.location.pathname);
            router.push(`/auth/signin?returnUrl=${returnUrl}`);
        }
    }, [router]);

    return (
        <>
            <DefaultLayout>
                {/* <ECommerce /> */}
            </DefaultLayout>
        </>
    );
}
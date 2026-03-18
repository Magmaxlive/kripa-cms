"use client";
import { useState, useEffect } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import SolutionsTable from "./components/table";
import { baseURL, } from '@/auth/auth'
import axios from 'axios';

const ViewSolutions = () => {
    const [xData, XData] = useState([]);

    useEffect(()=>{
        FetchAPI();
    },[]);

    const FetchAPI = async () => {
        var pr_url = `${baseURL}/api/SolutionsListView`;
        const data = await axios.get((pr_url), {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 9000,
        });
        let xData = XData(data?.data?.results);
    }

    return (
        <>
            <DefaultLayout>
                <Breadcrumb pageName="Solution Tables" />
                <div className="flex flex-col gap-10">
                    <SolutionsTable nData={xData} />
                </div>
            </DefaultLayout>
        </>
    )
}

export default ViewSolutions;
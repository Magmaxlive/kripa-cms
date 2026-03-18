"use client";
import { useState, useEffect } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import CasesTable from "./components/table";
import { baseURL, } from '@/auth/auth'
import axios from 'axios';

const ViewCaseStudies = () => {
    const [xData, XData] = useState([]);

    useEffect(()=>{
        FetchAPI();
    },[]);

    const FetchAPI = async () => {
        var pr_url = `${baseURL}/api/CasesStudiesListView`;
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
                <Breadcrumb pageName="Case Studies Tables" />
                <div className="flex flex-col gap-10">
                    <CasesTable nData={xData} />
                </div>
            </DefaultLayout>
        </>
    )
}

export default ViewCaseStudies;
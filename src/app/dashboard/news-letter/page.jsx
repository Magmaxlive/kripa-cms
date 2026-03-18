"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import BookingTable from "./components/table";
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import { baseURL, } from '@/auth/auth'
import axios from 'axios';

// export const metadata = {
//     title: "FBM - Bookings",
//     description: "Fortune business management",
// };

const TablesPage = () => {
    const [newsLetterData, NewsLetterData] = useState([]);

    useEffect(()=> {
      GetNewsLetterFromDb();
    },[]);

    async function GetNewsLetterFromDb() {
        var pr_url = `${baseURL}/api/NewsLetterListView`;
        const data = await axios.get((pr_url), {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 9000,
        });
        let xData = NewsLetterData(data?.data?.results);
      }

    return (<DefaultLayout>
      <Breadcrumb pageName="News Letter Tables"/>
      <div className="flex flex-col gap-10">
        <BookingTable newsLetterData={newsLetterData} />
      </div>
    </DefaultLayout>);
};
export default TablesPage;

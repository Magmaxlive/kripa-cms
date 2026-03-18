"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import BookingTable from "./components/table";
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import { baseURL, } from '@/auth/auth'
import axios from 'axios';
import ButtonDefault from "@/components/Buttons/ButtonDefault";
import DownloadButton from "@/components/Tables/component/download-b";

// export const metadata = {
//     title: "FBM - Bookings",
//     description: "Fortune business management",
// };

const TablesPage = () => {
  const [bookingsData, BookingData] = useState([]);

  useEffect(() => {
    GetBookingsFromDb();
  }, []);

  async function GetBookingsFromDb() {
    var pr_url = `${baseURL}/api/MessageListView`;
    const data = await axios.get((pr_url), {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 9000,
    });
    let xData = BookingData(data?.data?.results);
  }

  return (<DefaultLayout>
    <Breadcrumb pageName="Messages Tables" />

    
    <div className="flex justify-end">
      {/* <ButtonDefault label="Download Messages" link="#" customClasses="bg-primary rounded-lg text-white py-[11px] px-6 my-2">
        <DownloadButton />
      </ButtonDefault> */}
    </div>

    <div className="flex flex-col gap-10">
      <BookingTable bookingsData={bookingsData} />
    </div>
  </DefaultLayout>);
};
export default TablesPage;

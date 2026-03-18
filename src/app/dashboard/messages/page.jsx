"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import MessagesTable from "./components/table";
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import { baseURL, } from '@/auth/auth'
import axios from 'axios';


// export const metadata = {
//     title: "FBM - Bookings",
//     description: "Fortune business management",
// };
const MessagesPage = () => {
  const [messagesData, MessagesData] = useState([]);

  useEffect(() => {
    GetMessagesFromDb();
  }, []);

  async function GetMessagesFromDb() {
    var pr_url = `${baseURL}/api/MessageListView`;
    const data = await axios.get((pr_url), {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 9000,
    });
    let xData = MessagesData(data?.data?.results);
  }



  return (
    <DefaultLayout>
      <Breadcrumb pageName="Messages Tables" />
      <div className="flex flex-col gap-10">
        <MessagesTable messagesData={messagesData} />
      </div>
    </DefaultLayout>
  );
};
export default MessagesPage;

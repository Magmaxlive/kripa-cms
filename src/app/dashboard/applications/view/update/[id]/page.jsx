"use client";
import React, { useState, useEffect } from 'react';
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import AddAnnouncement from "../../../create/components/main";
import { baseURL,} from "@/auth/auth";
import axios from "axios";
import { useRouter } from 'next/navigation';

const UpdateAPI = () => {
    const [xList, setXList] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const path = window.location.pathname;
                const xId = path.split('/').filter(Boolean).pop();
                const url = `${baseURL}/api/${xId}/ApplicationsAPIView`;
                const { data } = await axios.get(url, { headers: { 'Content-Type': 'application/json' } });
                setXList(data.data);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div> Loading...</div>;

    return <DefaultLayout> <AddAnnouncement xData={xList} pageName={"Update Applications"} /> </DefaultLayout> ;
};

export default UpdateAPI;

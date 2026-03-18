"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { baseURL, authToken } from "@/auth/auth";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import TextEditor from "@/components/Inputs/text-editor";
import ButtonOne from "@/components/Buttons/button1";
import Loader from "@/components/Loader/loader";

const AddPrivacy = ({ pageName }) => {
    const [editorLoaded, setEditorLoaded] = useState(false);
    const [editorData, setEditorData] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, IsLoading] = useState(false);

    const PostEndPoint = "/CreateLegalDocs";
    const pageUrl = "/legal/privacy";

    useEffect(() => {
        setEditorLoaded(true);
    }, []);

    async function FetchPostAPI(e) {
        e.preventDefault();
        if (!editorData) return setMessage("Content is required");
        let data = JSON.stringify({
            "privacy": editorData
        })
        const postUrl = `${baseURL}/api/1${PostEndPoint}`;
        IsLoading(true);
        try {
            await axios.post(postUrl, data, {
                headers: {
                    'content-type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
            });
            window.location.href = `/dashboard/${pageUrl}`;
        } catch (err) {
            IsLoading(false);
            if (err.status === 401) { window.location.href = "/auth/signin"; }
            setMessage(err.response.data.name);
        }
    }

    const [xData, setXList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const url = `${baseURL}/api/1/LegalDocsAPIView`;
                const { data } = await axios.get(url, { headers: { 'Content-Type': 'application/json' } });
                setXList(data.data);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

 

    return (
        <>
            <Breadcrumb pageName={pageName} />
            <div className="">
                <div className="flex flex-col gap-9 mt-4">
                    <TextEditor TabName={"Content"} InputName={"Enter a your content"} editorData={xData?.privacy}
                        setEditorData={setEditorData} editorLoaded={editorLoaded} />
                </div>
                <p className="text-base mx-4 my-4 text-red-500">{message}</p>
                <div className="w-full sm:w-[200px]">
                    {isLoading ? (<Loader />) : (<ButtonOne label={"Submit"} buttonEvent={FetchPostAPI} />)}
                </div>
            </div>
        </>
    )
}

export default AddPrivacy;
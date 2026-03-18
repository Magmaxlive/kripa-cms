"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { baseURL, authToken } from "@/auth/auth";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import InputForm from "@/components/Inputs/input-form";
import FileField from "@/components/Inputs/file-field";
import TextEditor from "@/components/Inputs/text-editor";
import ButtonOne from "@/components/Buttons/button1";
import Loader from "@/components/Loader/loader";

const AddCategories = ({ xData, pageName }) => {
    const [editorLoaded, setEditorLoaded] = useState(false);
    const [editorData, setEditorData] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, IsLoading] = useState(false);

    const PostEndPoint = "/CreateCategory";
    const pageUrl = "/categories";
    const pageTitle = "categories";

    const [title, Title] = useState("");
    const [dataImage, setData] = useState({});
    const [imageName, ImageName] = useState("");

    useEffect(() => {
        setEditorLoaded(true);
        FetchDetails();
    }, []);

    const handleFile = (e) => {
        const file = e.target.files[0];
        const validImageTypes = ['image/gif', 'image/jpeg', 'image/png', 'image/webp', 'image/avif'];
        validImageTypes.includes(file?.type) ? setData(file) ||
            setMessage("") : setData(null) || setMessage("Only images are accepted");
    };

    async function FetchPostAPI(e) {
        e.preventDefault();
        if (!title) return setMessage("Title is required");
        if (!editorData) return setMessage("Content is required");
        const form_data = new FormData();
        if (dataImage?.name) form_data.append('image', dataImage);
        form_data.append('name', title);
        let meta_data = JSON.stringify({ "content": editorData })
        form_data.append('meta_data', meta_data);
        const postUrl = `${baseURL}/products/${xData?.id ?? '0'}${PostEndPoint}`;
        IsLoading(true);
        try {
            await axios.post(postUrl, form_data, {
                headers: {
                    'content-type': 'multipart/form-data',
                    'Authorization': `Bearer ${authToken}`,
                },
            });
            window.location.href = `/dashboard/${pageUrl}/view`;
        } catch (err) {
            IsLoading(false);
            if (err.status === 401) { window.location.href = "/auth/signin"; }
            setMessage(err.response.data.name);
        }
    }

    async function FetchDetails() {
        if (xData) {
            setEditorData(xData?.meta_data?.content);
            document.getElementById("TitleId").value = xData?.name;
            const imageId = xData.image.split('/').filter(Boolean).pop();
            ImageName(imageId);
        }
    }

    return (
        <>
            <Breadcrumb pageName={pageName} />
            <div className="">
                <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">
                    <InputForm TabName={"Title"} Id={"TitleId"} InputName={"Enter a Title"}
                        PlaceHolder={`Enter title for a ${pageTitle}`} TitleEvent={Title} />
                    <FileField TabName={"Image"} Id={"ContentId"} InputName={"Upload a cover pic"}
                        FileEvent={handleFile} ImageName={imageName} />
                </div>
                <div className="flex flex-col gap-9 mt-4">
                    <TextEditor TabName={"Content"} InputName={"Enter a your Descriptions"} editorData={editorData}
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

export default AddCategories;
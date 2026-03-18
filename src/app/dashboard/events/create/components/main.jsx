"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { baseURL, authToken } from "@/auth/auth";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import InputForm from "@/components/Inputs/input-form";
import FileField from "@/components/Inputs/file-field";
import TextArea from "@/components/Inputs/text-area";
import TextEditor from "@/components/Inputs/text-editor";
import ButtonOne from "@/components/Buttons/button1";
import Loader from "@/components/Loader/loader";

const AddEvents = ({ xData, pageName }) => {
    const [editorLoaded, setEditorLoaded] = useState(false);
    const [editorData, setEditorData] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, IsLoading] = useState(false);

    const PostEndPoint = "/CreateEvents";
    const pageUrl = "/events";
    const pageTitle = "event";

    const [title, Title] = useState("");
    const [innerTitle, InnerTitle] = useState("");
    const [desc, Desc] = useState("");

    const [dataImage, setData] = useState({});
    const [imageName, ImageName] = useState("");

    const [dataInnerImage, setInnerData] = useState({});
    const [imageInnerName, ImageInnerName] = useState("");

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

    const handleInnerFile = (e) => {
        const file = e.target.files[0];
        const validImageTypes = ['image/gif', 'image/jpeg', 'image/png', 'image/webp', 'image/avif'];
        validImageTypes.includes(file?.type) ? setInnerData(file) ||
            setMessage("") : setInnerData(null) || setMessage("Only images are accepted");
    };

    async function FetchPostAPI(e) {
        e.preventDefault();
        if (!title) return setMessage("Title is required");
        if (!innerTitle) return setMessage("Inner Title is required");
        if (!editorData) return setMessage("Content is required");
        if (!desc) return setMessage("Description is required");
        const form_data = new FormData();
        if (dataImage?.name) form_data.append('image', dataImage);
        if (dataInnerImage?.name) form_data.append('inner_image', dataInnerImage);
        form_data.append('name', title);
        form_data.append('content', editorData);
        let meta_data = JSON.stringify({"desc": desc, "inner_title": innerTitle});
        form_data.append('meta_data', meta_data);
        const postUrl = `${baseURL}/events/${xData?.id ?? '0'}${PostEndPoint}`;
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
            Title(xData?.name);
            setEditorData(xData?.content); Desc(xData?.meta_data?.desc);
            InnerTitle(xData?.meta_data?.inner_title)
            document.getElementById("TitleId").value = xData?.name;
            document.getElementById("InnerTitleId").value = xData?.meta_data?.inner_title;
            document.getElementById("DescId").value = xData?.meta_data?.desc;
            const imageId = xData?.image?.split('/').filter(Boolean).pop();
            ImageName(imageId);
            const imageInnerId = xData?.inner_image?.split('/').filter(Boolean).pop();
            ImageInnerName(imageInnerId);
        }
    }
    return (
        <>
             <Breadcrumb pageName={pageName} />
            <div className="">
                <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">
                    <InputForm TabName={"Title"} Id={"TitleId"} InputName={"Enter a Title"}
                        PlaceHolder={`Enter title for a ${pageTitle}`} TitleEvent={Title} />
                    <InputForm TabName={"Inner Title"} Id={"InnerTitleId"} InputName={"Enter a Inner Title"}
                        PlaceHolder={`Enter inner title for a ${pageTitle}`} TitleEvent={InnerTitle} />
                </div>
                <div className="grid grid-cols-1 gap-9 sm:grid-cols-2 my-4">
                    
                    <FileField TabName={"Image"} Id={"ImageId"} InputName={"Upload a cover pic"}
                        FileEvent={handleFile} ImageName={imageName} />

                    <FileField TabName={"Inner Image"} Id={"InnerImageId"} InputName={"Upload a inner pic"}
                        FileEvent={handleInnerFile} ImageName={imageInnerName} />
                </div>
                <div className="flex flex-col gap-9 mt-4">
                <TextArea TabName={"Desciption"} Id={"DescId"} InputName={"Enter a Description"}
                        PlaceHolder={`Enter Desciption for a ${pageTitle}`} TitleEvent={Desc} />
                </div>
                <div className="flex flex-col gap-9 mt-4">
                    <TextEditor TabName={"Content"} InputName={"Enter a your content"} editorData={editorData}
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

export default AddEvents;
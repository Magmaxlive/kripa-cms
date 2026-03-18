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

const AddProducts = ({ xData, pageName }) => {
    const [editorLoaded, setEditorLoaded] = useState(false);
    const [editorData, setEditorData] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, IsLoading] = useState(false);

    const PostEndPoint = "/CreateProducts";
    const pageUrl = "products";
    const pageTitle = "products";

    const [title, Title] = useState("");
    const [innerTitle, InnerTitle] = useState("");
    const [desc, Desc] = useState("");

    const [dataImage, setData] = useState({});
    const [imageName, ImageName] = useState("");

    const [dataInnerImage, setInnerData] = useState({});
    const [imageInnerName, ImageInnerName] = useState("");

    useEffect(() => {
        setEditorLoaded(true);
        FetchCategories();
        setTimeout(()=>{FetchDetails()},1000)
    }, []);

    const handleFile = (e) => {
        const file = e.target.files[0];
        const validImageTypes = ['image/gif', 'image/jpeg', 'image/png', 'image/webp', 'image/avif'];
        validImageTypes.includes(file?.type) ? setData(file) ||
            setMessage("") : setData(null) || setMessage("Only images are accepted");
    };

    const handleInnerFile = (e) => {
        const file = e.target.files[0];
        const validUploadTypes = ['image/gif', 'image/jpeg', 'image/png', 'image/webp', 'image/avif', 'application/pdf'];
        validUploadTypes.includes(file?.type) ? setInnerData(file) ||
            setMessage("") : setInnerData(null) || setMessage("Only images are accepted");
    };

    async function FetchPostAPI(e) {
        e.preventDefault();
        let cat = document.getElementById("ProductCategory").value;
        if (!cat) return setMessage("Select a category");
        if (!title) return setMessage("Title is required");
        if (!editorData) return setMessage("Content is required");
        const form_data = new FormData();
        form_data.append('category', cat);
        if (dataImage?.name) form_data.append('image', dataImage);
        if (dataInnerImage?.name) form_data.append('datasheet', dataInnerImage);
        form_data.append('name', title);
        let meta_data = JSON.stringify({ "desc": desc, "inner_title": innerTitle, "content": editorData });
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
            Title(xData?.name);
            document.getElementById("ProductCategory").value = xData?.category;
            setEditorData(xData?.meta_data?.content); Desc(xData?.meta_data?.desc);
            InnerTitle(xData?.meta_data?.inner_title)
            document.getElementById("TitleId").value = xData?.name;
            const imageId = xData?.image?.split('/').filter(Boolean).pop();
            ImageName(imageId);
            const imageInnerId = xData?.datasheet?.split('/').filter(Boolean).pop();
            ImageInnerName(imageInnerId); 
        }
    }


    const [catData, CatData] = useState([])
    async function FetchCategories() {
        var pr_url = `${baseURL}/products/CategoryListView`;
        try {
            const users = await axios.get((pr_url), {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
            });
            let catData = users?.data.results;
            CatData(catData); FetchDetails();
        } catch (e) { return false };
    }

    return (
        <>
            <Breadcrumb pageName={pageName} />
            <div className="">
                <div className="grid grid-cols-1 gap-9 sm:grid-cols-1">

                    <div className="rounded-[10px] border-b border px-6.5 border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
                        <div className="border-b border-stroke px-6.5 py-4 dark:border-dark-3">
                            <h3 className="font-medium text-dark dark:text-white">
                                Select a category
                            </h3>
                        </div>

                        <div className="mb-3">
                            <select className="appearance-none block w-full bg-gray-50 dark:text-gray-200 dark:bg-[#2a2a2a] text-[#2a2a2a] text-sm border-gray-200  py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" id="ProductCategory" data-te-select-init>
                                {catData.map((data, i) => {
                                    return ( <> <option value={data?.id}>{data.name}</option>  </> )
                                })}
                            </select>
                        </div>
                    </div>

                    <InputForm TabName={"Title"} Id={"TitleId"} InputName={"Enter a Title"}
                        PlaceHolder={`Enter title for a ${pageTitle}`} TitleEvent={Title} />
                </div>
                <div className="grid grid-cols-1 gap-9 sm:grid-cols-2 my-4">

                    <FileField TabName={"Image"} Id={"ImageId"} InputName={"Upload a cover pic"}
                        FileEvent={handleFile} ImageName={imageName} />

                    <FileField TabName={"Data Sheet"} Id={"InnerImageId"} InputName={"Upload a data sheet"}
                        FileEvent={handleInnerFile} ImageName={imageInnerName} />
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

export default AddProducts;
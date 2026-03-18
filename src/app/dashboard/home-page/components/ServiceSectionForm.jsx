"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { baseURL, authToken } from "@/auth/auth";
import Loader from "@/components/Loader/loader";
import { FiEdit, FiTrash, FiPlus, FiX } from "react-icons/fi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

// ---------- API FUNCTIONS ----------
const fetchServiceSection = () =>
  axios.get(`${baseURL}/service-section/`).then((res) => res.data);

const saveServiceSection = ({ id, ...data }) =>
  id
    ? axios.patch(`${baseURL}/service-section/${id}/`, data, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
    : axios.post(`${baseURL}/service-section/`, data, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

// ---------- Service_category API ----------
const fetchCategories = () =>
  axios.get(`${baseURL}/service-categories/`).then((res) => res.data);

const createCategory = (formData) =>
  axios.post(`${baseURL}/service-categories/`, formData, {
    headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "multipart/form-data" },
  });

const updateCategory = (formData) => {
  const id = formData.get("id");
  formData.delete("id");
  return axios.patch(`${baseURL}/service-categories/${id}/`, formData, {
    headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "multipart/form-data" },
  });
};

const deleteCategory = (id) =>
  axios.delete(`${baseURL}/service-categories/${id}/`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });

// ---------- SHARED UI ----------
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-boxdark rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

const Field = ({ label, id, value, onChange, placeholder, hint }) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="text-sm font-medium">{label}</label>
    <input
      id={id}
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder || `Enter ${label}`}
      className="border h-11 w-full rounded-md px-3 border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-meta-4 dark:border-strokedark"
    />
    {hint && <p className="text-xs text-gray-400">{hint}</p>}
  </div>
);

const TextareaField = ({ label, id, value, onChange, placeholder, rows = 3, hint }) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="text-sm font-medium">{label}</label>
    <textarea
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className="border w-full rounded-md px-3 py-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-meta-4 dark:border-strokedark resize-none"
    />
    {hint && <p className="text-xs text-gray-400">{hint}</p>}
  </div>
);

const ModalActions = ({ onClose, onSubmit, submitting, isEdit }) => (
  <div className="flex justify-end gap-3 mt-6">
    <button
      onClick={onClose}
      className="px-4 py-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
    >
      Cancel
    </button>
    <button
      onClick={onSubmit}
      disabled={submitting}
      className="px-4 py-2 rounded bg-primary text-white hover:bg-opacity-90 transition disabled:opacity-60"
    >
      {submitting ? "Saving..." : isEdit ? "Update" : "Save"}
    </button>
  </div>
);

// ---------- SERVICE SECTION SETTINGS FORM ----------
const ServiceSectionSettings = () => {
  const queryClient = useQueryClient();

  const { data: sectionList = [], isLoading } = useQuery({
    queryKey: ["service-section"],
    queryFn: fetchServiceSection,
  });

  const record = sectionList[0] || null;

  const [form, setForm] = useState({
    minor_heading: "",
    main_heading: "",
    paragraph: "",
  });

  useEffect(() => {
    if (record) {
      setForm({
        minor_heading: record.minor_heading || "",
        main_heading: record.main_heading || "",
        paragraph: record.paragraph || "",
      });
    }
  }, [record]);

  const mutation = useMutation({
    mutationFn: saveServiceSection,
    onSuccess: () => {
      queryClient.invalidateQueries(["service-section"]);
      toast.success("Service section saved successfully!");
    },
    onError: () => toast.error("Failed to save service section."),
  });

  const handleSubmit = () => {
    mutation.mutate({ id: record?.id, ...form });
  };

  if (isLoading) return <Loader />;

  return (
    <div className="max-w-2xl mx-auto mb-8 border-b pb-8">
      <h2 className="text-xl font-semibold mb-6">Service Section Settings</h2>
      <div className="space-y-4">
        <Field
          label="Minor Heading"
          id="minor_heading"
          value={form.minor_heading}
          onChange={(e) => setForm({ ...form, minor_heading: e.target.value })}
          placeholder="Our Products"
        />
        <Field
          label="Main Heading"
          id="main_heading"
          value={form.main_heading}
          onChange={(e) => setForm({ ...form, main_heading: e.target.value })}
          placeholder="Engineered for Harsh Environments"
        />
        <TextareaField
          label="Paragraph"
          id="paragraph"
          value={form.paragraph}
          onChange={(e) => setForm({ ...form, paragraph: e.target.value })}
          placeholder="Describe the service section..."
          rows={4}
        />
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={mutation.isPending}
            className="px-6 py-2 bg-primary text-white rounded hover:bg-opacity-90 disabled:opacity-50"
          >
            {mutation.isPending ? "Saving..." : "Save Section Settings"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------- SERVICE CATEGORY MODAL ----------
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2 MB

const ImageUploadField = ({ label, fieldName, existingUrl, file, onFileChange, onRemove, fileInputRef, required }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
      <span className="text-gray-400 font-normal ml-1">(image, max 2 MB)</span>
    </label>
    {(existingUrl || file) && (
      <div className="relative w-28 h-20 border rounded-md overflow-hidden bg-gray-50 flex items-center justify-center">
        <img
          src={file ? URL.createObjectURL(file) : existingUrl}
          alt={label}
          className="max-h-full max-w-full object-contain"
        />
        <button
          type="button"
          onClick={() => onRemove(fieldName)}
          className="absolute top-1 right-1 bg-white rounded-full shadow p-0.5 text-red-500 hover:text-red-700"
        >
          <FiX size={14} />
        </button>
      </div>
    )}
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      onChange={(e) => onFileChange(e, fieldName)}
      className="text-sm file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-opacity-90 cursor-pointer"
    />
  </div>
);

const CategoryModal = ({ isOpen, onClose, data }) => {
  const queryClient = useQueryClient();
  const isEdit = !!data;

  const EMPTY_FORM = {
    title: "",
    short_description: "",
    minor_heading: "",
    main_heading: "",
    brief_description: "",
  };

  const [form, setForm] = useState(EMPTY_FORM);
  const [files, setFiles] = useState({ cover_image: null, banner_image: null });
  const coverRef = React.useRef(null);
  const bannerRef = React.useRef(null);

  useEffect(() => {
    if (data) {
      setForm({
        title: data.title || "",
        short_description: data.short_description || "",
        minor_heading: data.minor_heading || "",
        main_heading: data.main_heading || "",
        brief_description: data.brief_description || "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setFiles({ cover_image: null, banner_image: null });
  }, [data]);

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed.");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error(`${fieldName === "cover_image" ? "Cover" : "Banner"} image must be 2 MB or smaller.`);
      e.target.value = "";
      return;
    }
    setFiles((prev) => ({ ...prev, [fieldName]: file }));
  };

  const handleRemove = (fieldName) => {
    setFiles((prev) => ({ ...prev, [fieldName]: null }));
    const ref = fieldName === "cover_image" ? coverRef : bannerRef;
    if (ref.current) ref.current.value = "";
  };

  const mutation = useMutation({
    mutationFn: isEdit ? updateCategory : createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries(["service-categories"]);
      toast.success(`Category ${isEdit ? "updated" : "created"} successfully!`);
      onClose();
    },
    onError: () => toast.error(`Failed to ${isEdit ? "update" : "create"} category.`),
  });

  const handleSubmit = () => {
    if (!form.title.trim()) { toast.error("Title is required."); return; }
    if (!form.short_description.trim()) { toast.error("Short description is required."); return; }
    if (!isEdit && !files.cover_image) { toast.error("Cover image is required."); return; }

    const fd = new FormData();
    if (isEdit) fd.append("id", data.id);
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (files.cover_image) fd.append("cover_image", files.cover_image);
    if (files.banner_image) fd.append("banner_image", files.banner_image);

    mutation.mutate(fd);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Edit Category" : "Add Category"}>
      <div className="flex flex-col gap-4">
        {/* Card fields */}
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Card / Listing</p>
        <Field label="Title" id="title" value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <TextareaField label="Short Description" id="short_description" value={form.short_description}
          onChange={(e) => setForm({ ...form, short_description: e.target.value })}
          placeholder="Brief summary shown on the card" rows={2} />
        <ImageUploadField
          label="Cover Image" fieldName="cover_image"
          existingUrl={data?.cover_image} file={files.cover_image}
          onFileChange={handleFileChange} onRemove={handleRemove}
          fileInputRef={coverRef} required={!isEdit}
        />

        <hr className="border-gray-200 dark:border-strokedark" />

        {/* Detail page fields */}
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Detail Page</p>
        <Field label="Minor Heading" id="minor_heading" value={form.minor_heading}
          onChange={(e) => setForm({ ...form, minor_heading: e.target.value })} />
        <Field label="Main Heading" id="main_heading" value={form.main_heading}
          onChange={(e) => setForm({ ...form, main_heading: e.target.value })} />
        <TextareaField label="Brief Description" id="brief_description" value={form.brief_description}
          onChange={(e) => setForm({ ...form, brief_description: e.target.value })}
          placeholder="Full description shown on the detail page" rows={4} />
        <ImageUploadField
          label="Banner Image" fieldName="banner_image"
          existingUrl={data?.banner_image} file={files.banner_image}
          onFileChange={handleFileChange} onRemove={handleRemove}
          fileInputRef={bannerRef}
        />
      </div>
      <ModalActions onClose={onClose} onSubmit={handleSubmit} submitting={mutation.isPending} isEdit={isEdit} />
    </Modal>
  );
};

// ---------- SERVICE CATEGORIES LIST ----------
const ServiceCategories = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["service-categories"],
    queryFn: fetchCategories,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries(["service-categories"]);
      toast.success("Category deleted.");
    },
    onError: () => toast.error("Failed to delete category."),
  });

  const handleClose = () => { setModalOpen(false); setSelected(null); };

  if (isLoading) return <Loader />;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Service Categories</h2>
        <button
          onClick={() => { setSelected(null); setModalOpen(true); }}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90"
        >
          <FiPlus /> Add New
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((item) => (
          <div key={item.id} className="border p-4 rounded bg-white dark:bg-boxdark">
            {item.cover_image && (
              <img src={item.cover_image} alt={item.title} className="h-24 w-full object-cover rounded mb-3" />
            )}
            <h3 className="font-semibold">{item.title}</h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.short_description}</p>
            <div className="flex justify-end gap-2 text-primary mt-3">
              <button onClick={() => { setSelected(item); setModalOpen(true); }}><FiEdit /></button>
              <button
                onClick={() => { if (confirm("Delete this category?")) deleteMutation.mutate(item.id); }}
                className="text-red-500"
                disabled={deleteMutation.isPending}
              >
                <FiTrash />
              </button>
            </div>
          </div>
        ))}
        {categories.length === 0 && <p className="text-gray-500">No categories found.</p>}
      </div>

      <CategoryModal isOpen={modalOpen} onClose={handleClose} data={selected} />
    </div>
  );
};

// ---------- PAGE EXPORT ----------
const ServiceSectionPage = () => (
  <div className="p-4">
    <ServiceSectionSettings />
    <ServiceCategories />
  </div>
);

export default ServiceSectionPage;
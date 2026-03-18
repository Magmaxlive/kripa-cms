"use client";
import React, { useState } from "react";
import axios from "axios";
import { baseURL, authToken } from "@/auth/auth";
import Loader from "@/components/Loader/loader";
import { FiEdit, FiTrash, FiPlus, FiX } from "react-icons/fi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

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

// ---------- MODAL ----------
// Rendered via a portal so it always sits above the fixed header (z-[9999])
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      style={{ zIndex: 9999 }}
    >
      <div
        className="bg-white dark:bg-boxdark rounded-lg shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        style={{ zIndex: 10000 }}
      >
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

// ---------- SHARED FIELDS ----------
const Field = ({ label, id, value, onChange, placeholder }) => (
  <div className="flex flex-col gap-2">
    <label htmlFor={id} className="text-sm font-medium">{label}</label>
    <input
      id={id}
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder || `Enter ${label}`}
      className="border h-11 w-full rounded-md px-3 border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-meta-4 dark:border-strokedark"
    />
  </div>
);

const TextareaField = ({ label, id, value, onChange, placeholder, rows = 3 }) => (
  <div className="flex flex-col gap-2">
    <label htmlFor={id} className="text-sm font-medium">{label}</label>
    <textarea
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className="border w-full rounded-md px-3 py-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-meta-4 dark:border-strokedark resize-none"
    />
  </div>
);

// CKEditor wrapper — keeps the label + border consistent with other fields
// `editorKey` forces a remount whenever the initial content changes (CKEditor
// ignores prop updates after mount, so remounting is the correct pattern).
const RichTextField = ({ label, value, onChange, editorKey }) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm font-medium">{label}</label>
    <div className="border border-gray-300 rounded-md overflow-hidden dark:border-strokedark [&_.ck-editor__editable]:min-h-[320px] [&_.ck-editor__editable]:text-sm [&_.ck-editor__editable]:px-4 [&_.ck-editor__editable]:dark:bg-meta-4 [&_.ck-toolbar]:dark:bg-boxdark [&_.ck-toolbar]:dark:border-strokedark">
      <CKEditor
        key={editorKey}
        editor={ClassicEditor}
        data={value}
        onChange={(_event, editor) => onChange(editor.getData())}
        config={{
          toolbar: [
            "heading", "|",
            "bold", "italic", "underline", "|",
            "bulletedList", "numberedList", "|",
            "blockQuote", "link", "|",
            "undo", "redo",
          ],
        }}
      />
    </div>
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

const DisplayField = ({ label, value }) => (
  <div className="flex flex-col gap-2 w-full">
    <label className="text-sm font-medium">{label}</label>
    <p className="border min-h-12 w-full rounded-md p-3 border-gray-300 text-sm text-gray-700 dark:text-gray-300 dark:border-strokedark">
      {value || "—"}
    </p>
  </div>
);

// ---------- IMAGE UPLOAD FIELD ----------
const MAX_IMAGE_SIZE = 1 * 1024 * 1024; // 1 MB

const ImageUploadField = ({ label, fieldName, existingUrl, file, onFileChange, onRemove, fileInputRef, required }) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm font-medium">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
      <span className="text-gray-400 font-normal ml-1">(image, max 1 MB)</span>
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

// ---------- SERVICE SECTION MODAL ----------
const ServiceSectionModal = ({ isOpen, onClose, data }) => {
  const queryClient = useQueryClient();

  // Derive state directly — no useEffect needed because Modal unmounts when
  // closed (early return in Modal), so every open is a fresh mount with
  // the latest data already available as a prop.
  const [form, setForm] = useState(() => ({
    minor_heading: data?.minor_heading || "",
    main_heading: data?.main_heading || "",
    paragraph: data?.paragraph || "",
  }));

  // Keep form in sync if data arrives after mount (e.g. slow network)
  React.useEffect(() => {
    setForm({
      minor_heading: data?.minor_heading || "",
      main_heading: data?.main_heading || "",
      paragraph: data?.paragraph || "",
    });
  }, [data]);

  const mutation = useMutation({
    mutationFn: saveServiceSection,
    onSuccess: () => {
      queryClient.invalidateQueries(["service-section"]);
      toast.success("Service section updated successfully!");
      onClose();
    },
    onError: () => toast.error("Failed to update service section."),
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Service Section">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </div>
        <TextareaField
          label="Paragraph"
          id="paragraph"
          value={form.paragraph}
          onChange={(e) => setForm({ ...form, paragraph: e.target.value })}
          placeholder="Describe the service section..."
          rows={4}
        />
      </div>
      <ModalActions
        onClose={onClose}
        onSubmit={() => mutation.mutate({ id: data?.id, ...form })}
        submitting={mutation.isPending}
        isEdit={true}
      />
    </Modal>
  );
};

// ---------- CATEGORY MODAL ----------
const EMPTY_CATEGORY_FORM = {
  title: "",
  short_description: "",
  minor_heading: "",
  main_heading: "",
  brief_description: "",
};

const formFromData = (data) =>
  data
    ? {
        title: data.title || "",
        short_description: data.short_description || "",
        minor_heading: data.minor_heading || "",
        main_heading: data.main_heading || "",
        brief_description: data.brief_description || "",
      }
    : EMPTY_CATEGORY_FORM;

const CategoryModal = ({ isOpen, onClose, data }) => {
  const queryClient = useQueryClient();
  const isEdit = !!data;

  // Initialise directly from data — Modal unmounts on close so every open
  // is a fresh mount. The useEffect below keeps it in sync for slow fetches.
  const [form, setForm] = useState(() => formFromData(data));
  const [files, setFiles] = useState({ cover_image: null, banner_image: null });
  const coverRef = React.useRef(null);
  const bannerRef = React.useRef(null);

  React.useEffect(() => {
    setForm(formFromData(data));
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
      toast.error("Image must be 1 MB or smaller.");
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

        {/* ── Card / Listing ── */}
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Card / Listing</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Title" id="title" value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Field label="Short Description" id="short_description" value={form.short_description}
            onChange={(e) => setForm({ ...form, short_description: e.target.value })} />
        </div>
        <ImageUploadField
          label="Cover Image" fieldName="cover_image"
          existingUrl={data?.cover_image} file={files.cover_image}
          onFileChange={handleFileChange} onRemove={handleRemove}
          fileInputRef={coverRef} required={!isEdit}
        />

        <hr className="border-gray-200 dark:border-strokedark" />

        {/* ── Detail Page ── */}
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Detail Page</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Minor Heading" id="minor_heading" value={form.minor_heading}
            onChange={(e) => setForm({ ...form, minor_heading: e.target.value })} />
          <Field label="Main Heading" id="main_heading" value={form.main_heading}
            onChange={(e) => setForm({ ...form, main_heading: e.target.value })} />
        </div>

        {/* CKEditor for brief_description */}
        <RichTextField
          label="Brief Description"
          value={form.brief_description}
          onChange={(val) => setForm({ ...form, brief_description: val })}
          editorKey={`${data?.id ?? "new"}-${isOpen}`}
        />

        <ImageUploadField
          label="Banner Image" fieldName="banner_image"
          existingUrl={data?.banner_image} file={files.banner_image}
          onFileChange={handleFileChange} onRemove={handleRemove}
          fileInputRef={bannerRef}
        />
      </div>
      <ModalActions
        onClose={onClose}
        onSubmit={handleSubmit}
        submitting={mutation.isPending}
        isEdit={isEdit}
      />
    </Modal>
  );
};

// ---------- MAIN COMPONENT ----------
const ServiceSectionForm = () => {
  const queryClient = useQueryClient();

  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const { data: sectionResponse, isLoading: loadingSection } = useQuery({
    queryKey: ["service-section"],
    queryFn: fetchServiceSection,
  });
  // API may return an array or a single object — handle both
  const sectionData = Array.isArray(sectionResponse)
    ? sectionResponse[0] || null
    : sectionResponse || null;

  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ["service-categories"],
    queryFn: fetchCategories,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries(["service-categories"]);
      toast.success("Category deleted successfully!");
    },
    onError: () => toast.error("Failed to delete category."),
  });

  const handleEditCategory = (item) => { setSelectedCategory(item); setCategoryModalOpen(true); };
  const handleAddCategory = () => { setSelectedCategory(null); setCategoryModalOpen(true); };
  const handleDeleteCategory = (id) => {
    if (confirm("Are you sure you want to delete this category?")) deleteMutation.mutate(id);
  };

  return (
    <>
      <ServiceSectionModal
        isOpen={sectionModalOpen}
        onClose={() => setSectionModalOpen(false)}
        data={sectionData}
      />
      <CategoryModal
        key={`${selectedCategory?.id ?? "new"}-${categoryModalOpen}`}
        isOpen={categoryModalOpen}
        onClose={() => { setCategoryModalOpen(false); setSelectedCategory(null); }}
        data={selectedCategory}
      />

      <div className="flex flex-col gap-8">

        {/* ── Service Section header card ── */}
        <div className="bg-white dark:bg-boxdark rounded-lg shadow-sm p-6 border border-stroke dark:border-strokedark">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Service Section</h2>
            <button
              onClick={() => setSectionModalOpen(true)}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90 transition"
            >
              <FiEdit /> Edit
            </button>
          </div>
          {loadingSection ? (
            <p className="text-gray-400 text-sm">Loading...</p>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <DisplayField label="Minor Heading" value={sectionData?.minor_heading} />
                <DisplayField label="Main Heading" value={sectionData?.main_heading} />
              </div>
              <DisplayField label="Paragraph" value={sectionData?.paragraph} />
            </div>
          )}
        </div>

        {/* ── Service Categories image card grid ── */}
        <div className="bg-white dark:bg-boxdark rounded-lg shadow-sm p-6 border border-stroke dark:border-strokedark">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Service Categories</h2>
            <button
              onClick={handleAddCategory}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90 transition"
            >
              <FiPlus /> Add
            </button>
          </div>

          {loadingCategories ? (
            <p className="text-gray-400 text-sm">Loading...</p>
          ) : categories.length === 0 ? (
            <p className="text-gray-400 text-sm">No categories added yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {categories.map((item) => (
                <div
                  key={item.id}
                  className="group relative rounded-xl overflow-hidden border border-gray-200 dark:border-strokedark shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-meta-4"
                >
                  {/* Cover image */}
                  <div className="relative h-44 w-full bg-gray-100 dark:bg-gray-800">
                    {item.cover_image ? (
                      <img
                        src={item.cover_image}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-300 text-xs">
                        No image
                      </div>
                    )}
                    {/* Action buttons — appear on hover */}
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditCategory(item)}
                        className="bg-white text-blue-500 hover:text-blue-700 p-1.5 rounded-full shadow"
                        title="Edit"
                      >
                        <FiEdit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(item.id)}
                        className="bg-white text-red-500 hover:text-red-700 p-1.5 rounded-full shadow"
                        title="Delete"
                        disabled={deleteMutation.isPending}
                      >
                        <FiTrash size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-4">
                    <h3 className="font-semibold text-sm text-gray-800 dark:text-white truncate capitalize">
                      {item.title || "—"}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                      {item.short_description || "—"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </>
  );
};

export default ServiceSectionForm;
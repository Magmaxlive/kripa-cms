"use client";
import React, { useState } from "react";
import axios from "axios";
import { baseURL, authToken } from "@/auth/auth";
import { FiEdit, FiX } from "react-icons/fi";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

// ─────────────────────────────────────────────
// API
// ─────────────────────────────────────────────
const MAX_SIZE = 1 * 1024 * 1024; // 1 MB

const fetchSection = () => axios.get(`${baseURL}/about-first-section/`).then(r => r.data);

const saveSection = (formData) => {
  const id = formData.get("id");
  formData.delete("id");
  return axios.patch(`${baseURL}/about-first-section/${id}/`, formData, {
    headers: {"Content-Type": "multipart/form-data" },
  });
};

// ─────────────────────────────────────────────
// SHARED UI
// ─────────────────────────────────────────────
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" style={{ zIndex: 9999 }}>
      <div className="bg-white dark:bg-boxdark rounded-lg shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto" style={{ zIndex: 10000 }}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><FiX size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
};

const Field = ({ label, id, value, onChange, placeholder, error, required }) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="text-sm font-medium">
      {label}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      id={id} type="text" value={value} onChange={onChange}
      placeholder={placeholder || `Enter ${label}`}
      className={`border h-11 w-full rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-meta-4 transition
        ${error ? "border-red-400 focus:ring-red-400" : "border-gray-300 dark:border-strokedark"}`}
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

const TextareaField = ({ label, id, value, onChange, placeholder, rows = 3, error, required }) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="text-sm font-medium">
      {label}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <textarea
      id={id} value={value} onChange={onChange} placeholder={placeholder} rows={rows}
      className={`border w-full rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-meta-4 resize-none transition
        ${error ? "border-red-400 focus:ring-red-400" : "border-gray-300 dark:border-strokedark"}`}
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

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
    <button onClick={onClose} className="px-4 py-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 transition">Cancel</button>
    <button onClick={onSubmit} disabled={submitting} className="px-4 py-2 rounded bg-primary text-white hover:bg-opacity-90 transition disabled:opacity-60">
      {submitting ? "Saving..." : isEdit ? "Update" : "Save"}
    </button>
  </div>
);

const DisplayField = ({ label, value }) => (
  <div className="flex flex-col gap-1.5 w-full">
    <label className="text-sm font-medium">{label}</label>
    <p className="border min-h-11 w-full rounded-md p-3 border-gray-300 text-sm text-gray-700 dark:text-gray-300 dark:border-strokedark">
      {value || "—"}
    </p>
  </div>
);

// Image upload field with preview
const ImageUploadField = ({ label, fieldName, existingUrl, file, onFileChange, onRemove, fileInputRef, required }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
      <span className="text-gray-400 font-normal ml-1">(image, max 1 MB)</span>
    </label>
    {(existingUrl || file) && (
      <div className="relative w-full h-36 border rounded-lg overflow-hidden bg-gray-50 dark:bg-meta-4 flex items-center justify-center">
        <img
          src={file ? URL.createObjectURL(file) : existingUrl}
          alt={label}
          className="max-h-full max-w-full object-contain"
        />
        <button
          type="button"
          onClick={() => onRemove(fieldName)}
          className="absolute top-2 right-2 bg-white rounded-full shadow p-1 text-red-500 hover:text-red-700"
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

// ─────────────────────────────────────────────
// SECTION MODAL
// ─────────────────────────────────────────────
const SectionModal = ({ isOpen, onClose, data }) => {
  const queryClient = useQueryClient();
  const isEdit = true;

  const [form, setForm] = useState(() => ({
    minor_heading: data?.minor_heading || "",
    main_heading:  data?.main_heading  || "",
    paragraph:     data?.paragraph     || "",
    button_text:   data?.button_text   || "",
    button_link:   data?.button_link   || "",
    button_icon:   data?.button_icon   || "",
  }));
  const [files, setFiles]   = useState({ image: null, banner_image: null });
  const [errors, setErrors] = useState({});
  const imageRef            = React.useRef(null);
  const bannerRef           = React.useRef(null);

  React.useEffect(() => {
    setForm({
      minor_heading: data?.minor_heading || "",
      main_heading:  data?.main_heading  || "",
      paragraph:     data?.paragraph     || "",
      button_text:   data?.button_text   || "",
      button_link:   data?.button_link   || "",
      button_icon:   data?.button_icon   || "",
    });
    setFiles({ image: null, banner_image: null });
    setErrors({});
  }, [data]);

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors(ev => ({ ...ev, [fieldName]: "Only image files are allowed." }));
      e.target.value = "";
      return;
    }
    if (file.size > MAX_SIZE) {
      setErrors(ev => ({ ...ev, [fieldName]: "Image must be 1 MB or smaller." }));
      e.target.value = "";
      return;
    }
    setFiles(prev => ({ ...prev, [fieldName]: file }));
    setErrors(ev => ({ ...ev, [fieldName]: "" }));
  };

  const handleRemove = (fieldName) => {
    setFiles(prev => ({ ...prev, [fieldName]: null }));
    const ref = fieldName === "image" ? imageRef : bannerRef;
    if (ref.current) ref.current.value = "";
  };

  const mutation = useMutation({
    mutationFn: saveSection,
    onSuccess: () => {
      queryClient.invalidateQueries(["about-first-section"]);
      toast.success("About section saved successfully!");
      onClose();
    },
    onError: () => toast.error("Failed to save about section."),
  });

  const validate = () => {
    const e = {};
    if (!form.minor_heading.trim()) e.minor_heading = "Minor heading is required.";
    if (!form.main_heading.trim())  e.main_heading  = "Main heading is required.";
    if (!form.button_text.trim())   e.button_text   = "Button text is required.";
    if (!form.button_link.trim())   e.button_link   = "Button link is required.";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});

    const fd = new FormData();
    if (isEdit) fd.append("id", data.id);
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (files.image)        fd.append("image",        files.image);
    if (files.banner_image) fd.append("banner_image", files.banner_image);
    mutation.mutate(fd);
  };

  const set = (key) => (ev) => {
    setForm(f => ({ ...f, [key]: ev.target.value }));
    setErrors(e => ({ ...e, [key]: "" }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit About Section">
      <div className="flex flex-col gap-4">

        {/* ── Images ── */}
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Images</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <ImageUploadField
              label="Main Image" fieldName="image"
              existingUrl={data?.image} file={files.image}
              onFileChange={handleFileChange} onRemove={handleRemove}
              fileInputRef={imageRef}
            />
            {errors.image && <p className="text-xs text-red-500">{errors.image}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <ImageUploadField
              label="Banner Image" fieldName="banner_image"
              existingUrl={data?.banner_image} file={files.banner_image}
              onFileChange={handleFileChange} onRemove={handleRemove}
              fileInputRef={bannerRef}
            />
            {errors.banner_image && <p className="text-xs text-red-500">{errors.banner_image}</p>}
          </div>
        </div>

        <hr className="border-gray-200 dark:border-strokedark" />

        {/* ── Content ── */}
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Content</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Minor Heading" id="minor_heading" value={form.minor_heading} onChange={set("minor_heading")} placeholder="About Us"              error={errors.minor_heading} required />
          <Field label="Main Heading"  id="main_heading"  value={form.main_heading}  onChange={set("main_heading")}  placeholder="Who We Are"             error={errors.main_heading}  required />
        </div>
        <RichTextField
          label="Paragraph"
          value={form.paragraph}
          onChange={(val) => { setForm(f => ({ ...f, paragraph: val })); setErrors(e => ({ ...e, paragraph: "" })); }}
          editorKey={`about-para-${data?.id ?? "init"}-${isOpen}`}
        />

        <hr className="border-gray-200 dark:border-strokedark" />

        {/* ── Button ── */}
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Button</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Button Text" id="button_text" value={form.button_text} onChange={set("button_text")} placeholder="Learn More"   error={errors.button_text} required />
          <Field label="Button Link" id="button_link" value={form.button_link} onChange={set("button_link")} placeholder="/about"        error={errors.button_link} required />
          <Field label="Button Icon" id="button_icon" value={form.button_icon} onChange={set("button_icon")} placeholder="ArrowRight"   error={errors.button_icon} />
        </div>

      </div>
      <ModalActions onClose={onClose} onSubmit={handleSubmit} submitting={mutation.isPending} isEdit={isEdit} />
    </Modal>
  );
};

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────
const AboutFirstSectionForm = () => {
  const [modalOpen, setModalOpen] = useState(false);

  const { data: secResp, isLoading } = useQuery({
    queryKey: ["about-first-section"],
    queryFn:  fetchSection,
  });

  const sectionData = Array.isArray(secResp) ? secResp[0] || null : secResp || null;

  return (
    <>
      <SectionModal
        key={`about-${sectionData?.id ?? "init"}-${modalOpen}`}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        data={sectionData}
      />

      <div className="bg-white dark:bg-boxdark rounded-lg shadow-sm p-6 border border-stroke dark:border-strokedark">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">About — First Section</h2>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90 transition"
          >
            <FiEdit size={14} /> Edit
          </button>
        </div>

        {isLoading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : !sectionData ? (
          <p className="text-gray-400 text-sm">No data found.</p>
        ) : (
          <div className="flex flex-col gap-6">

            {/* Images preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Main Image</label>
                {sectionData.image ? (
                  <img src={sectionData.image} alt="Main" className="h-40 w-full object-cover rounded-lg border border-gray-200 dark:border-strokedark" />
                ) : (
                  <div className="h-40 w-full rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs">No image</div>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Banner Image</label>
                {sectionData.banner_image ? (
                  <img src={sectionData.banner_image} alt="Banner" className="h-40 w-full object-cover rounded-lg border border-gray-200 dark:border-strokedark" />
                ) : (
                  <div className="h-40 w-full rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs">No banner image</div>
                )}
              </div>
            </div>

            {/* Content fields */}
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <DisplayField label="Minor Heading" value={sectionData.minor_heading} />
                <DisplayField label="Main Heading"  value={sectionData.main_heading} />
              </div>
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-sm font-medium">Paragraph</label>
                <div
                  className="border min-h-11 w-full rounded-md p-3 border-gray-300 text-sm text-gray-700 dark:text-gray-300 dark:border-strokedark prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: sectionData.paragraph || "—" }}
                />
              </div>
            </div>

            {/* Button fields */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <DisplayField label="Button Text" value={sectionData.button_text} />
              <DisplayField label="Button Link" value={sectionData.button_link} />
              <DisplayField label="Button Icon" value={sectionData.button_icon} />
            </div>

          </div>
        )}
      </div>
    </>
  );
};

export default AboutFirstSectionForm;
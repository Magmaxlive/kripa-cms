"use client";
import React, { useState } from "react";
import axios from "axios";
import { baseURL } from "@/auth/auth";
import { FiEdit, FiX } from "react-icons/fi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

// ---------- API ----------
const multipartHeaders = {"Content-Type": "multipart/form-data" };

const fetchCareerPage = () =>
  axios.get(`${baseURL}/career-page/`).then(r => {
    const d = r.data;
    return Array.isArray(d) ? d[0] || null : d || null;
  });

const saveCareerPage = (formData) => {
  const id = formData.get("id");
  formData.delete("id");
  return id
    ? axios.patch(`${baseURL}/career-page/${id}/`, formData, { headers: multipartHeaders })
    : axios.post(`${baseURL}/career-page/`, formData, { headers: multipartHeaders });
};

// ---------- CONSTANTS ----------
const MAX_IMAGE_SIZE = 1 * 1024 * 1024;

// ---------- MODAL ----------
const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-4xl" }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" style={{ zIndex: 9999 }}>
      <div className={`bg-white dark:bg-boxdark rounded-lg shadow-2xl p-6 w-full ${maxWidth} max-h-[90vh] overflow-y-auto`} style={{ zIndex: 10000 }}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><FiX size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
};

// ---------- SHARED FIELDS ----------
const RichTextField = ({ label, value, onChange, editorKey, error, required }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium">
      {label}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <div className={`border rounded-md overflow-visible dark:border-strokedark
      [&_.ck-editor__editable]:min-h-[200px] [&_.ck-editor__editable]:text-sm [&_.ck-editor__editable]:px-4
      [&_.ck-editor__editable]:dark:bg-meta-4 [&_.ck-toolbar]:dark:bg-boxdark [&_.ck-toolbar]:dark:border-strokedark
      [&_.ck-toolbar]:sticky [&_.ck-toolbar]:top-0 [&_.ck-toolbar]:z-10
      ${error ? "border-red-400" : "border-gray-300 dark:border-strokedark"}`}>
      <CKEditor
        key={editorKey}
        editor={ClassicEditor}
        data={value}
        onChange={(_event, editor) => onChange(editor.getData())}
        config={{ toolbar: ["heading","|","bold","italic","underline","|","bulletedList","numberedList","|","blockQuote","link","|","undo","redo"] }}
      />
    </div>
    {error && <p className="text-xs text-red-500">{error}</p>}
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
  <div className="flex flex-col gap-2 w-full">
    <label className="text-sm font-medium">{label}</label>
    <p className="border min-h-10 w-full rounded-md p-3 border-gray-300 text-sm text-gray-700 dark:text-gray-300 dark:border-strokedark">
      {value || "—"}
    </p>
  </div>
);

// ---------- IMAGE UPLOAD FIELD ----------
const ImageUploadField = ({ label, fieldName, existingUrl, file, onFileChange, onRemove, fileInputRef, required, error }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium">
      {label}{required && <span className="text-red-500 ml-1">*</span>}
      <span className="text-gray-400 font-normal ml-1">(image, max 1 MB)</span>
    </label>
    {(existingUrl || file) && (
      <div className="relative w-32 h-20 border rounded-md overflow-hidden bg-gray-50 flex items-center justify-center">
        <img src={file ? URL.createObjectURL(file) : existingUrl} alt={label} className="max-h-full max-w-full object-cover" />
        <button type="button" onClick={() => onRemove(fieldName)}
          className="absolute top-1 right-1 bg-white rounded-full shadow p-0.5 text-red-500 hover:text-red-700">
          <FiX size={14} />
        </button>
      </div>
    )}
    <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => onFileChange(e, fieldName)}
      className="text-sm file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-opacity-90 cursor-pointer" />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

// ---------- CAREER PAGE MODAL ----------
const CareerPageModal = ({ isOpen, onClose, data }) => {
  const queryClient = useQueryClient();
  const isEdit = !!data;

  const [form, setForm] = useState(() => ({
    description: data?.description || "",
    benefits:    data?.benefits    || "",
  }));
  const [files, setFiles] = useState({
    banner_image: null,
    image:        null,
    image2:       null,
  });
  const [errors, setErrors]   = useState({});
  const bannerRef = React.useRef(null);
  const imageRef  = React.useRef(null);
  const image2Ref = React.useRef(null);

  const refs = { banner_image: bannerRef, image: imageRef, image2: image2Ref };

  React.useEffect(() => {
    setForm({ description: data?.description || "", benefits: data?.benefits || "" });
    setFiles({ banner_image: null, image: null, image2: null });
    setErrors({});
  }, [data, isOpen]);

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((ev) => ({ ...ev, [fieldName]: "Only image files are allowed." }));
      e.target.value = ""; return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setErrors((ev) => ({ ...ev, [fieldName]: "Image must be 1 MB or smaller." }));
      e.target.value = ""; return;
    }
    setFiles((prev) => ({ ...prev, [fieldName]: file }));
    setErrors((ev) => ({ ...ev, [fieldName]: "" }));
  };

  const handleRemove = (fieldName) => {
    setFiles((prev) => ({ ...prev, [fieldName]: null }));
    if (refs[fieldName].current) refs[fieldName].current.value = "";
  };

  const mutation = useMutation({
    mutationFn: saveCareerPage,
    onSuccess: () => {
      queryClient.invalidateQueries(["career-page"]);
      toast.success("Career page updated successfully!");
      onClose();
    },
    onError: () => toast.error("Failed to update career page."),
  });

  const validate = () => {
    const e = {};
    if (!form.description.replace(/<[^>]*>/g, "").trim()) e.description = "Description is required.";
    if (!form.benefits.replace(/<[^>]*>/g, "").trim())    e.benefits    = "Benefits is required.";
    if (!isEdit && !files.image)  e.image  = "Image is required.";
    if (!isEdit && !files.image2) e.image2 = "Image 2 is required.";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    const fd = new FormData();
    if (data?.id) fd.append("id", data.id);
    fd.append("description", form.description);
    fd.append("benefits",    form.benefits);
    if (files.banner_image) fd.append("banner_image", files.banner_image);
    if (files.image)        fd.append("image",        files.image);
    if (files.image2)       fd.append("image2",       files.image2);
    mutation.mutate(fd);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Edit Career Page" : "Setup Career Page"} maxWidth="max-w-3xl">
      <div className="flex flex-col gap-5">

        <ImageUploadField
          label="Banner Image" fieldName="banner_image"
          existingUrl={data?.banner_image} file={files.banner_image} error={errors.banner_image}
          onFileChange={handleFileChange} onRemove={handleRemove} fileInputRef={bannerRef}
        />

        <hr className="border-gray-200 dark:border-strokedark" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ImageUploadField
            label="Image" fieldName="image" required={!isEdit}
            existingUrl={data?.image} file={files.image} error={errors.image}
            onFileChange={handleFileChange} onRemove={handleRemove} fileInputRef={imageRef}
          />
          <ImageUploadField
            label="Image 2" fieldName="image2" required={!isEdit}
            existingUrl={data?.image2} file={files.image2} error={errors.image2}
            onFileChange={handleFileChange} onRemove={handleRemove} fileInputRef={image2Ref}
          />
        </div>

        <hr className="border-gray-200 dark:border-strokedark" />

        <RichTextField
          label="Description" required
          value={form.description} error={errors.description}
          editorKey={`description-${data?.id ?? "new"}-${isOpen}`}
          onChange={(val) => {
            setForm((f) => ({ ...f, description: val }));
            setErrors((e) => ({ ...e, description: "" }));
          }}
        />

        <RichTextField
          label="Benefits" required
          value={form.benefits} error={errors.benefits}
          editorKey={`benefits-${data?.id ?? "new"}-${isOpen}`}
          onChange={(val) => {
            setForm((f) => ({ ...f, benefits: val }));
            setErrors((e) => ({ ...e, benefits: "" }));
          }}
        />

      </div>
      <ModalActions onClose={onClose} onSubmit={handleSubmit} submitting={mutation.isPending} isEdit={isEdit} />
    </Modal>
  );
};

// ---------- MAIN COMPONENT ----------
const CareerPageForm = () => {
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["career-page"],
    queryFn:  fetchCareerPage,
  });

  return (
    <>
      <CareerPageModal
        key={`${data?.id ?? "new"}-${modalOpen}`}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        data={data}
      />

      <div className="bg-white dark:bg-boxdark rounded-lg shadow-sm p-6 border border-stroke dark:border-strokedark">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Career Page</h2>
          <button onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90 transition">
            <FiEdit /> {data ? "Edit" : "Setup"}
          </button>
        </div>

        {isLoading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : !data ? (
          <p className="text-gray-400 text-sm">No career page data yet. Click Setup to get started.</p>
        ) : (
          <div className="flex flex-col gap-6">

            {/* Images */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Banner Image", src: data.banner_image },
                { label: "Image",        src: data.image        },
                { label: "Image 2",      src: data.image2       },
              ].map(({ label, src }) => (
                <div key={label}>
                  <p className="text-sm font-medium mb-1.5">{label}</p>
                  {src ? (
                    <img src={src} alt={label} className="h-28 w-full object-cover rounded-md border border-gray-200 dark:border-strokedark" />
                  ) : (
                    <div className="h-28 w-full rounded-md border border-gray-200 dark:border-strokedark bg-gray-50 flex items-center justify-center text-xs text-gray-300">
                      No image
                    </div>
                  )}
                </div>
              ))}
            </div>

            <hr className="border-gray-200 dark:border-strokedark" />

            {/* Rich text display */}
            <DisplayField label="Description" value={data.description?.replace(/<[^>]*>/g, " ").trim()} />
            <DisplayField label="Benefits"    value={data.benefits?.replace(/<[^>]*>/g, " ").trim()} />

          </div>
        )}
      </div>
    </>
  );
};

export default CareerPageForm;
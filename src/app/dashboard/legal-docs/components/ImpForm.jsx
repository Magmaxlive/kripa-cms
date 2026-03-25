"use client";
import React, { useState } from "react";
import axios from "axios";
import { baseURL} from "@/auth/auth";
import { FiEdit, FiX } from "react-icons/fi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

// ---------- API ----------
const multipartHeaders = {"Content-Type": "multipart/form-data" };

const fetchImportant = () =>
  axios.get(`${baseURL}/important/`).then(r => {
    const d = r.data;
    return Array.isArray(d) ? d[0] || null : d || null;
  });

const saveImportant = (formData) => {
  const id = formData.get("id");
  formData.delete("id");
  return id
    ? axios.patch(`${baseURL}/important/${id}/`, formData, { headers: multipartHeaders })
    : axios.post(`${baseURL}/important/`, formData, { headers: multipartHeaders });
};

// ---------- CONSTANTS ----------
const MAX_IMAGE_SIZE = 1 * 1024 * 1024;

// ---------- MODAL ----------
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

// ---------- SHARED FIELDS ----------
const RichTextField = ({ label, value, onChange, editorKey, error, required }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium">
      {label}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <div className={`border rounded-md overflow-visible dark:border-strokedark
      [&_.ck-editor__editable]:min-h-[400px] [&_.ck-editor__editable]:text-sm [&_.ck-editor__editable]:px-4
      [&_.ck-editor__editable]:dark:bg-meta-4 [&_.ck-toolbar]:dark:bg-boxdark [&_.ck-toolbar]:dark:border-strokedark
      [&_.ck-toolbar]:sticky [&_.ck-toolbar]:top-0 [&_.ck-toolbar]:z-10
      ${error ? "border-red-400" : "border-gray-300 dark:border-strokedark"}`}>
      <CKEditor
        key={editorKey}
        editor={ClassicEditor}
        data={value}
        onChange={(_event, editor) => onChange(editor.getData())}
        config={{
        toolbar: [
            "heading", "|",
            "bold", "italic", "underline", "|",
            "alignment", "|",
            "bulletedList", "numberedList", "|",
            "blockQuote", "link", "|",
            "insertTable", "mediaEmbed", "|",
            "undo", "redo",
        ],
        }}
                                
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

// ---------- IMAGE UPLOAD FIELD ----------
const ImageUploadField = ({ label, fieldName, existingUrl, file, onFileChange, onRemove, fileInputRef, error }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium">
      {label}
      <span className="text-gray-400 font-normal ml-1">(image, max 1 MB)</span>
    </label>
    {(existingUrl || file) && (
      <div className="relative w-40 h-24 border rounded-md overflow-hidden bg-gray-50 flex items-center justify-center">
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

// ---------- Important information MODAL ----------
const ImportantModal = ({ isOpen, onClose, data }) => {
  const queryClient = useQueryClient();
  const isEdit = !!data;

  const [content, setContent]   = useState(data?.content || "");
  const [bannerFile, setBannerFile] = useState(null);
  const [errors, setErrors]     = useState({});
  const bannerRef = React.useRef(null);

  React.useEffect(() => {
    setContent(data?.content || "");
    setBannerFile(null);
    setErrors({});
  }, [data, isOpen]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((ev) => ({ ...ev, banner_image: "Only image files are allowed." }));
      e.target.value = ""; return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setErrors((ev) => ({ ...ev, banner_image: "Image must be 1 MB or smaller." }));
      e.target.value = ""; return;
    }
    setBannerFile(file);
    setErrors((ev) => ({ ...ev, banner_image: "" }));
  };

  const handleRemove = () => {
    setBannerFile(null);
    if (bannerRef.current) bannerRef.current.value = "";
  };

  const mutation = useMutation({
    mutationFn: saveImportant,
    onSuccess: () => {
      queryClient.invalidateQueries(["Important"]);
      toast.success("Important information updated successfully!");
      onClose();
    },
    onError: () => toast.error("Failed to update Important information."),
  });

  const handleSubmit = () => {
    const e = {};
    if (!content.replace(/<[^>]*>/g, "").trim()) e.content = "Content is required.";
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    const fd = new FormData();
    if (data?.id) fd.append("id", data.id);
    fd.append("content", content);
    if (bannerFile) fd.append("banner_image", bannerFile);
    mutation.mutate(fd);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Edit Important information" : "Setup Important Information"}>
      <div className="flex flex-col gap-5">
        <ImageUploadField
          label="Banner Image" fieldName="banner_image"
          existingUrl={data?.banner_image} file={bannerFile} error={errors.banner_image}
          onFileChange={handleFileChange} onRemove={handleRemove} fileInputRef={bannerRef}
        />
        <hr className="border-gray-200 dark:border-strokedark" />
        <RichTextField
          label="Content" required
          value={content} error={errors.content}
          editorKey={`Important-${data?.id ?? "new"}-${isOpen}`}
          onChange={(val) => { setContent(val); setErrors((e) => ({ ...e, content: "" })); }}
        />
      </div>
      <ModalActions onClose={onClose} onSubmit={handleSubmit} submitting={mutation.isPending} isEdit={isEdit} />
    </Modal>
  );
};

// ---------- MAIN COMPONENT ----------
const ImportantForm = () => {
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["Important"],
    queryFn:  fetchImportant,
  });

  return (
    <>
      <ImportantModal
        key={`${data?.id ?? "new"}-${modalOpen}`}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        data={data}
      />

      <div className="bg-white dark:bg-boxdark rounded-lg shadow-sm p-6 border border-stroke dark:border-strokedark">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Important Information</h2>
          <button onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90 transition">
            <FiEdit /> {data ? "Edit" : "Setup"}
          </button>
        </div>

        {isLoading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : !data ? (
          <p className="text-gray-400 text-sm">No Important Information Click Setup to get started.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {data.banner_image && (
              <div>
                <p className="text-sm font-medium mb-1.5">Banner Image</p>
                <img src={data.banner_image} alt="Banner" className="h-32 rounded-md object-cover border border-gray-200 dark:border-strokedark" />
              </div>
            )}
            <div>
              <p className="text-sm font-medium mb-1.5">Content Preview</p>
              <div
                className="ck-content border border-gray-200 dark:border-strokedark rounded-md p-4 text-sm text-gray-700 dark:text-gray-300 max-h-80 overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: data.content }}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ImportantForm;
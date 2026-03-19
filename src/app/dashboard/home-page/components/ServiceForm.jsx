"use client";
import React, { useState } from "react";
import axios from "axios";
import { baseURL, authToken } from "@/auth/auth";
import { FiEdit, FiTrash, FiPlus, FiX, FiHelpCircle, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

// ---------- API FUNCTIONS ----------
const fetchServiceSection = () =>
  axios.get(`${baseURL}/service-section/`).then((res) => res.data);

const saveServiceSection = ({ id, ...data }) =>
  id
    ? axios.patch(`${baseURL}/service-section/${id}/`, data, { headers: { Authorization: `Bearer ${authToken}` } })
    : axios.post(`${baseURL}/service-section/`, data, { headers: { Authorization: `Bearer ${authToken}` } });

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
  axios.delete(`${baseURL}/service-categories/${id}/`, { headers: { Authorization: `Bearer ${authToken}` } });

// ---------- FAQ API FUNCTIONS ----------
const fetchFaqs = (categoryId) =>
  axios.get(`${baseURL}/category-faq/`, { params: { category: categoryId } }).then((res) => res.data);

const createFaq = ({ categoryId, question, answer }) =>
  axios.post(`${baseURL}/category-faq/`, { category: categoryId, question, answer }, {
    headers: { Authorization: `Bearer ${authToken}` },
  });

const updateFaq = ({ id, question, answer }) =>
  axios.patch(`${baseURL}/category-faq/${id}/`, { question, answer }, {
    headers: { Authorization: `Bearer ${authToken}` },
  });

const deleteFaq = (id) =>
  axios.delete(`${baseURL}/category-faq/${id}/`, { headers: { Authorization: `Bearer ${authToken}` } });

// ---------- MODAL ----------
const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-3xl" }) => {
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

// ── RichTextField now supports error + required ──
const RichTextField = ({ label, value, onChange, editorKey, error, required }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium">
      {label}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <div className={`border rounded-md overflow-hidden dark:border-strokedark
      [&_.ck-editor__editable]:min-h-[320px] [&_.ck-editor__editable]:text-sm [&_.ck-editor__editable]:px-4
      [&_.ck-editor__editable]:dark:bg-meta-4 [&_.ck-toolbar]:dark:bg-boxdark [&_.ck-toolbar]:dark:border-strokedark
      ${error ? "border-red-400" : "border-gray-300"}`}>
      <CKEditor
        key={editorKey} editor={ClassicEditor} data={value}
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
    <p className="border min-h-12 w-full rounded-md p-3 border-gray-300 text-sm text-gray-700 dark:text-gray-300 dark:border-strokedark">
      {value || "—"}
    </p>
  </div>
);

// ---------- IMAGE UPLOAD FIELD ----------
const MAX_IMAGE_SIZE = 1 * 1024 * 1024;

const ImageUploadField = ({ label, fieldName, existingUrl, file, onFileChange, onRemove, fileInputRef, required, error }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium">
      {label}{required && <span className="text-red-500 ml-1">*</span>}
      <span className="text-gray-400 font-normal ml-1">(image, max 1 MB)</span>
    </label>
    {(existingUrl || file) && (
      <div className="relative w-28 h-20 border rounded-md overflow-hidden bg-gray-50 flex items-center justify-center">
        <img src={file ? URL.createObjectURL(file) : existingUrl} alt={label} className="max-h-full max-w-full object-contain" />
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

// ---------- SERVICE SECTION MODAL ----------
const ServiceSectionModal = ({ isOpen, onClose, data }) => {
  const queryClient = useQueryClient();

  const [form, setForm] = useState(() => ({
    minor_heading: data?.minor_heading || "",
    main_heading:  data?.main_heading  || "",
    paragraph:     data?.paragraph     || "",
  }));
  const [errors, setErrors] = useState({});

  React.useEffect(() => {
    setForm({
      minor_heading: data?.minor_heading || "",
      main_heading:  data?.main_heading  || "",
      paragraph:     data?.paragraph     || "",
    });
    setErrors({});
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

  const validate = () => {
    const e = {};
    if (!form.minor_heading.trim()) e.minor_heading = "Minor heading is required.";
    if (!form.main_heading.trim())  e.main_heading  = "Main heading is required.";
    if (!form.paragraph.trim())     e.paragraph     = "Paragraph is required.";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    mutation.mutate({ id: data?.id, ...form });
  };

  const set = (key) => (ev) => {
    setForm((f) => ({ ...f, [key]: ev.target.value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Service Section">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Minor Heading" id="minor_heading" required
            value={form.minor_heading} error={errors.minor_heading}
            onChange={set("minor_heading")} placeholder="Our Products" />
          <Field label="Main Heading" id="main_heading" required
            value={form.main_heading} error={errors.main_heading}
            onChange={set("main_heading")} placeholder="Engineered for Harsh Environments" />
        </div>
        <TextareaField label="Paragraph" id="paragraph" required
          value={form.paragraph} error={errors.paragraph}
          onChange={set("paragraph")} placeholder="Describe the service section..." rows={4} />
      </div>
      <ModalActions onClose={onClose} onSubmit={handleSubmit} submitting={mutation.isPending} isEdit={true} />
    </Modal>
  );
};

// ---------- CATEGORY MODAL ----------
const EMPTY_CATEGORY_FORM = {
  title: "", short_description: "", minor_heading: "", main_heading: "", brief_description: "",
};

const formFromData = (data) =>
  data
    ? { title: data.title || "", short_description: data.short_description || "", minor_heading: data.minor_heading || "", main_heading: data.main_heading || "", brief_description: data.brief_description || "" }
    : EMPTY_CATEGORY_FORM;

const CategoryModal = ({ isOpen, onClose, data }) => {
  const queryClient = useQueryClient();
  const isEdit = !!data;
  const [form, setForm]     = useState(() => formFromData(data));
  const [files, setFiles]   = useState({ cover_image: null, banner_image: null });
  const [errors, setErrors] = useState({});
  const coverRef  = React.useRef(null);
  const bannerRef = React.useRef(null);

  React.useEffect(() => {
    setForm(formFromData(data));
    setFiles({ cover_image: null, banner_image: null });
    setErrors({});
  }, [data]);

  const set = (key) => (ev) => {
    setForm((f) => ({ ...f, [key]: ev.target.value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

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

  const validate = () => {
    const e = {};
    if (!form.title.trim())             e.title             = "Title is required.";
    if (!form.short_description.trim()) e.short_description = "Short description is required.";
    if (!isEdit && !files.cover_image)  e.cover_image       = "Cover image is required.";
    if (!form.minor_heading.trim())     e.minor_heading     = "Minor heading is required.";
    if (!form.main_heading.trim())      e.main_heading      = "Main heading is required.";
    // Strip HTML tags to check if CKEditor content is truly empty
    if (!form.brief_description.replace(/<[^>]*>/g, "").trim()) e.brief_description = "Brief description is required.";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    const fd = new FormData();
    if (isEdit) fd.append("id", data.id);
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (files.cover_image)  fd.append("cover_image",  files.cover_image);
    if (files.banner_image) fd.append("banner_image", files.banner_image);
    mutation.mutate(fd);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Edit Category" : "Add Category"}>
      <div className="flex flex-col gap-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Card / Listing</p>
        <div className="grid grid-cols-1 gap-4">
          <Field label="Title" id="title" required value={form.title} error={errors.title} onChange={set("title")} />
          <Field label="Short Description" id="short_description" required
            value={form.short_description} error={errors.short_description} onChange={set("short_description")} />
        </div>
        <ImageUploadField
          label="Cover Image" fieldName="cover_image" required={!isEdit}
          existingUrl={data?.cover_image} file={files.cover_image} error={errors.cover_image}
          onFileChange={handleFileChange} onRemove={handleRemove} fileInputRef={coverRef}
        />

        <hr className="border-gray-200 dark:border-strokedark" />

        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Detail Page</p>
        <div className="grid grid-cols-1 gap-4">
          <Field label="Minor Heading" id="minor_heading" required
            value={form.minor_heading} error={errors.minor_heading} onChange={set("minor_heading")} />
          <Field label="Main Heading" id="main_heading" required
            value={form.main_heading} error={errors.main_heading} onChange={set("main_heading")} />
        </div>
        <RichTextField
          label="Brief Description" required
          value={form.brief_description}
          error={errors.brief_description}
          onChange={(val) => {
            setForm((f) => ({ ...f, brief_description: val }));
            setErrors((e) => ({ ...e, brief_description: "" }));
          }}
          editorKey={`${data?.id ?? "new"}-${isOpen}`}
        />
        <ImageUploadField
          label="Banner Image" fieldName="banner_image"
          existingUrl={data?.banner_image} file={files.banner_image} error={errors.banner_image}
          onFileChange={handleFileChange} onRemove={handleRemove} fileInputRef={bannerRef}
        />
      </div>
      <ModalActions onClose={onClose} onSubmit={handleSubmit} submitting={mutation.isPending} isEdit={isEdit} />
    </Modal>
  );
};

// ---------- FAQ FORM ROW (inline add / edit) ----------
const EMPTY_FAQ = { question: "", answer: "" };

const FaqFormRow = ({ initial = EMPTY_FAQ, onSave, onCancel, saving }) => {
  const [form, setForm]     = useState(initial);
  const [errors, setErrors] = useState({});

  const set = (key) => (ev) => {
    setForm((f) => ({ ...f, [key]: ev.target.value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const handleSave = () => {
    const e = {};
    if (!form.question.trim()) e.question = "Question is required.";
    if (!form.answer.trim())   e.answer   = "Answer is required.";
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave(form);
  };

  return (
    <div className="flex flex-col gap-3 p-4 rounded-lg border border-primary/30 bg-primary/5 dark:bg-primary/10">
      <Field label="Question" id="faq-question" required
        value={form.question} error={errors.question}
        onChange={set("question")} placeholder="e.g. What services do you offer?" />
      <TextareaField label="Answer" id="faq-answer" required
        value={form.answer} error={errors.answer}
        onChange={set("answer")} placeholder="Write the answer here..." rows={3} />
      <div className="flex justify-end gap-2 mt-1">
        <button onClick={onCancel} className="px-3 py-1.5 text-sm rounded border border-gray-300 text-gray-600 hover:bg-gray-100 transition">Cancel</button>
        <button onClick={handleSave} disabled={saving}
          className="px-3 py-1.5 text-sm rounded bg-primary text-white hover:bg-opacity-90 transition disabled:opacity-60">
          {saving ? "Saving..." : "Save FAQ"}
        </button>
      </div>
    </div>
  );
};

// ---------- FAQ ITEM (read mode) ----------
const FaqItem = ({ faq, onEdit, onDelete, deleting }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 dark:border-strokedark rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-meta-4 transition-colors"
        onClick={() => setOpen((v) => !v)}>
        <span className="text-sm font-medium text-gray-800 dark:text-white flex-1 pr-4">{faq.question}</span>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="text-blue-500 hover:text-blue-700 p-1 rounded transition" title="Edit"><FiEdit size={14} /></button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="text-red-500 hover:text-red-700 p-1 rounded transition" title="Delete" disabled={deleting}><FiTrash size={14} /></button>
          {open ? <FiChevronUp size={16} className="text-gray-400" /> : <FiChevronDown size={16} className="text-gray-400" />}
        </div>
      </div>
      {open && (
        <div className="px-4 pb-4 pt-1 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-strokedark">
          {faq.answer}
        </div>
      )}
    </div>
  );
};

// ---------- FAQ MODAL ----------
const FaqModal = ({ isOpen, onClose, category }) => {
  const queryClient = useQueryClient();
  const categoryId  = category?.id;
  const [editingId, setEditingId] = useState(null);
  const [addingNew, setAddingNew] = useState(false);

  React.useEffect(() => {
    if (isOpen) { setEditingId(null); setAddingNew(false); }
  }, [isOpen, categoryId]);

  const { data: faqs = [], isLoading } = useQuery({
    queryKey: ["service-faqs", categoryId],
    queryFn:  () => fetchFaqs(categoryId),
    enabled:  !!categoryId && isOpen,
  });

  const invalidate = () => queryClient.invalidateQueries(["service-faqs", categoryId]);

  const createMutation = useMutation({
    mutationFn: createFaq,
    onSuccess: () => { invalidate(); toast.success("FAQ added successfully!"); setAddingNew(false); },
    onError: () => toast.error("Failed to add FAQ."),
  });
  const updateMutation = useMutation({
    mutationFn: updateFaq,
    onSuccess: () => { invalidate(); toast.success("FAQ updated successfully!"); setEditingId(null); },
    onError: () => toast.error("Failed to update FAQ."),
  });
  const deleteMutation = useMutation({
    mutationFn: deleteFaq,
    onSuccess: () => { invalidate(); toast.success("FAQ deleted successfully!"); },
    onError: () => toast.error("Failed to delete FAQ."),
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl"
      title={<span className="flex items-center gap-2"><FiHelpCircle className="text-primary" size={18} />FAQs — <span className="text-primary">{category?.title}</span></span>}>
      <div className="flex flex-col gap-4">
        {!addingNew && (
          <button onClick={() => { setAddingNew(true); setEditingId(null); }}
            className="flex items-center gap-2 text-sm text-primary border border-primary/40 hover:bg-primary/5 px-3 py-2 rounded-lg transition self-start">
            <FiPlus size={15} /> Add FAQ
          </button>
        )}
        {addingNew && (
          <FaqFormRow
            onSave={(form) => createMutation.mutate({ categoryId, ...form })}
            onCancel={() => setAddingNew(false)}
            saving={createMutation.isPending}
          />
        )}
        {isLoading ? (
          <p className="text-sm text-gray-400 py-4 text-center">Loading FAQs…</p>
        ) : faqs.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">No FAQs yet. Click "Add FAQ" to get started.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {faqs.map((faq) =>
              editingId === faq.id ? (
                <FaqFormRow key={faq.id}
                  initial={{ question: faq.question, answer: faq.answer }}
                  onSave={(form) => updateMutation.mutate({ id: faq.id, ...form })}
                  onCancel={() => setEditingId(null)}
                  saving={updateMutation.isPending}
                />
              ) : (
                <FaqItem key={faq.id} faq={faq}
                  onEdit={() => { setEditingId(faq.id); setAddingNew(false); }}
                  onDelete={() => { if (confirm("Delete this FAQ?")) deleteMutation.mutate(faq.id); }}
                  deleting={deleteMutation.isPending && deleteMutation.variables === faq.id}
                />
              )
            )}
          </div>
        )}
      </div>
      <div className="flex justify-end mt-6">
        <button onClick={onClose} className="px-4 py-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 transition">Close</button>
      </div>
    </Modal>
  );
};

// ---------- MAIN COMPONENT ----------
const ServiceSectionForm = () => {
  const queryClient = useQueryClient();
  const [sectionModalOpen,  setSectionModalOpen]  = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [selectedCategory,  setSelectedCategory]  = useState(null);
  const [faqModalOpen,      setFaqModalOpen]      = useState(false);
  const [faqCategory,       setFaqCategory]       = useState(null);

  const { data: sectionResponse, isLoading: loadingSection } = useQuery({
    queryKey: ["service-section"],
    queryFn:  fetchServiceSection,
  });
  const sectionData = Array.isArray(sectionResponse) ? sectionResponse[0] || null : sectionResponse || null;

  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ["service-categories"],
    queryFn:  fetchCategories,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => { queryClient.invalidateQueries(["service-categories"]); toast.success("Category deleted successfully!"); },
    onError: () => toast.error("Failed to delete category."),
  });

  const handleEditCategory   = (item) => { setSelectedCategory(item); setCategoryModalOpen(true); };
  const handleAddCategory    = ()     => { setSelectedCategory(null); setCategoryModalOpen(true); };
  const handleDeleteCategory = (id)   => { if (confirm("Are you sure you want to delete this category?")) deleteMutation.mutate(id); };
  const handleManageFaqs     = (item) => { setFaqCategory(item); setFaqModalOpen(true); };

  return (
    <>
      <ServiceSectionModal isOpen={sectionModalOpen} onClose={() => setSectionModalOpen(false)} data={sectionData} />
      <CategoryModal
        key={`${selectedCategory?.id ?? "new"}-${categoryModalOpen}`}
        isOpen={categoryModalOpen}
        onClose={() => { setCategoryModalOpen(false); setSelectedCategory(null); }}
        data={selectedCategory}
      />
      <FaqModal
        isOpen={faqModalOpen}
        onClose={() => { setFaqModalOpen(false); setFaqCategory(null); }}
        category={faqCategory}
      />

      <div className="flex flex-col gap-8">

        {/* ── Service Section header card ── */}
        <div className="bg-white dark:bg-boxdark rounded-lg shadow-sm p-6 border border-stroke dark:border-strokedark">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Service Section</h2>
            <button onClick={() => setSectionModalOpen(true)}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90 transition">
              <FiEdit /> Edit
            </button>
          </div>
          {loadingSection ? (
            <p className="text-gray-400 text-sm">Loading...</p>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <DisplayField label="Minor Heading" value={sectionData?.minor_heading} />
                <DisplayField label="Main Heading"  value={sectionData?.main_heading}  />
              </div>
              <DisplayField label="Paragraph" value={sectionData?.paragraph} />
            </div>
          )}
        </div>

        {/* ── Service Categories image card grid ── */}
        <div className="bg-white dark:bg-boxdark rounded-lg shadow-sm p-6 border border-stroke dark:border-strokedark">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Service Categories</h2>
            <button onClick={handleAddCategory}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90 transition">
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
                <div key={item.id}
                  className="group relative rounded-xl overflow-hidden border border-gray-200 dark:border-strokedark shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-meta-4">
                  <div className="relative h-44 w-full bg-gray-100 dark:bg-gray-800">
                    {item.cover_image ? (
                      <img src={item.cover_image} alt={item.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-300 text-xs">No image</div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEditCategory(item)}
                        className="bg-white text-blue-500 hover:text-blue-700 p-1.5 rounded-full shadow" title="Edit">
                        <FiEdit size={14} />
                      </button>
                      <button onClick={() => handleDeleteCategory(item.id)}
                        className="bg-white text-red-500 hover:text-red-700 p-1.5 rounded-full shadow" title="Delete"
                        disabled={deleteMutation.isPending}>
                        <FiTrash size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm text-gray-800 dark:text-white truncate capitalize">{item.title || "—"}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{item.short_description || "—"}</p>
                    <button onClick={() => handleManageFaqs(item)}
                      className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs font-medium text-primary border border-primary/30 hover:bg-primary/5 py-1.5 rounded-md transition">
                      <FiHelpCircle size={13} /> Manage FAQs
                    </button>
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
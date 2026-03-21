"use client";
import React, { useState } from "react";
import axios from "axios";
import { baseURL, authToken } from "@/auth/auth";
import { FiEdit, FiTrash, FiPlus, FiX, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

// ---------- API ----------
const authHeaders = { Authorization: `Bearer ${authToken}` };

const fetchFaqs   = () => axios.get(`${baseURL}/general-faqs/`).then(r => r.data);
const createFaq   = (data) => axios.post(`${baseURL}/general-faqs/`, data, { headers: authHeaders });
const updateFaq   = ({ id, ...data }) => axios.patch(`${baseURL}/general-faqs/${id}/`, data, { headers: authHeaders });
const deleteFaq   = (id) => axios.delete(`${baseURL}/general-faqs/${id}/`, { headers: authHeaders });

// ---------- MODAL ----------
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" style={{ zIndex: 9999 }}>
      <div className="bg-white dark:bg-boxdark rounded-lg shadow-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto" style={{ zIndex: 10000 }}>
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

const TextareaField = ({ label, id, value, onChange, placeholder, rows = 4, error, required }) => (
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

// ---------- FAQ MODAL ----------
const FaqModal = ({ isOpen, onClose, data }) => {
  const queryClient = useQueryClient();
  const isEdit = !!data;

  const [form, setForm]     = useState(() => ({ question: data?.question || "", answer: data?.answer || "" }));
  const [errors, setErrors] = useState({});

  React.useEffect(() => {
    setForm({ question: data?.question || "", answer: data?.answer || "" });
    setErrors({});
  }, [data, isOpen]);

  const set = (key) => (ev) => {
    setForm((f) => ({ ...f, [key]: ev.target.value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const mutation = useMutation({
    mutationFn: isEdit ? updateFaq : createFaq,
    onSuccess: () => {
      queryClient.invalidateQueries(["general-faqs"]);
      toast.success(`FAQ ${isEdit ? "updated" : "added"} successfully!`);
      onClose();
    },
    onError: () => toast.error(`Failed to ${isEdit ? "update" : "add"} FAQ.`),
  });

  const validate = () => {
    const e = {};
    if (!form.question.trim()) e.question = "Question is required.";
    if (!form.answer.replace(/<[^>]*>/g, "").trim()) e.answer = "Answer is required.";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    mutation.mutate(isEdit ? { id: data.id, ...form } : form);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Edit FAQ" : "Add FAQ"}>
      <div className="flex flex-col gap-4">
        <Field label="Question" id="question" required
          value={form.question} error={errors.question}
          onChange={set("question")} placeholder="e.g. How do I apply?" />
        <RichTextField label="Answer" required
          value={form.answer} error={errors.answer}
          editorKey={`answer-${data?.id ?? "new"}-${isOpen}`}
          onChange={(val) => {
            setForm((f) => ({ ...f, answer: val }));
            setErrors((e) => ({ ...e, answer: "" }));
          }}
        />
      </div>
      <ModalActions onClose={onClose} onSubmit={handleSubmit} submitting={mutation.isPending} isEdit={isEdit} />
    </Modal>
  );
};

// ---------- FAQ ITEM (accordion read mode) ----------
const FaqItem = ({ faq, onEdit, onDelete, deleting }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 dark:border-strokedark rounded-lg overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-meta-4 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="text-sm font-medium text-gray-800 dark:text-white flex-1 pr-4">{faq.question}</span>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="text-blue-500 hover:text-blue-700 p-1 rounded transition" title="Edit">
            <FiEdit size={14} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="text-red-500 hover:text-red-700 p-1 rounded transition" title="Delete" disabled={deleting}>
            <FiTrash size={14} />
          </button>
          {open ? <FiChevronUp size={16} className="text-gray-400" /> : <FiChevronDown size={16} className="text-gray-400" />}
        </div>
      </div>
      {open && (
        <div
          className="ck-content px-4 pb-4 pt-1 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-strokedark"
          dangerouslySetInnerHTML={{ __html: faq.answer }}
        />
      )}
    </div>
  );
};

// ---------- MAIN COMPONENT ----------
const GeneralFaqsForm = () => {
  const queryClient = useQueryClient();
  const [modalOpen,     setModalOpen]     = useState(false);
  const [selectedFaq,   setSelectedFaq]   = useState(null);

  const { data: faqs = [], isLoading } = useQuery({
    queryKey: ["general-faqs"],
    queryFn:  fetchFaqs,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFaq,
    onSuccess: () => { queryClient.invalidateQueries(["general-faqs"]); toast.success("FAQ deleted successfully!"); },
    onError: () => toast.error("Failed to delete FAQ."),
  });

  const handleEdit   = (faq) => { setSelectedFaq(faq); setModalOpen(true); };
  const handleAdd    = ()    => { setSelectedFaq(null); setModalOpen(true); };
  const handleDelete = (id)  => { if (confirm("Are you sure you want to delete this FAQ?")) deleteMutation.mutate(id); };

  return (
    <>
      <FaqModal
        key={`${selectedFaq?.id ?? "new"}-${modalOpen}`}
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedFaq(null); }}
        data={selectedFaq}
      />

      <div className="bg-white dark:bg-boxdark rounded-lg shadow-sm p-6 border border-stroke dark:border-strokedark">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">General FAQs</h2>
            {faqs.length > 0 && (
              <p className="text-sm text-gray-400 mt-0.5">{faqs.length} question{faqs.length !== 1 ? "s" : ""}</p>
            )}
          </div>
          <button onClick={handleAdd}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90 transition">
            <FiPlus /> Add FAQ
          </button>
        </div>

        {isLoading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : faqs.length === 0 ? (
          <p className="text-gray-400 text-sm">No FAQs added yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {faqs.map((faq) => (
              <FaqItem
                key={faq.id}
                faq={faq}
                onEdit={() => handleEdit(faq)}
                onDelete={() => handleDelete(faq.id)}
                deleting={deleteMutation.isPending && deleteMutation.variables === faq.id}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default GeneralFaqsForm;
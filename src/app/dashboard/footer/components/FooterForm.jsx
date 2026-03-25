"use client";
import React, { useState } from "react";
import axios from "axios";
import { baseURL} from "@/auth/auth";
import { FiEdit, FiTrash, FiPlus, FiX } from "react-icons/fi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

// ---------- API ----------
const multipartHeaders = {"Content-Type": "multipart/form-data" };

// Footer
const fetchFooter = () =>
  axios.get(`${baseURL}/footer/`).then(r => {
    const d = r.data;
    return Array.isArray(d) ? d[0] || null : d || null;
  });

const saveFooter = (formData) => {
  const id = formData.get("id");
  formData.delete("id");
  return id
    ? axios.patch(`${baseURL}/footer/${id}/`, formData, { headers: multipartHeaders })
    : axios.post(`${baseURL}/footer/`, formData, { headers: multipartHeaders });
};

// Emails
const fetchEmails  = () => axios.get(`${baseURL}/footer-emails/`).then(r => r.data);
const createEmail  = (data) => axios.post(`${baseURL}/footer-emails/`, data);
const updateEmail  = ({ id, ...data }) => axios.patch(`${baseURL}/footer-emails/${id}/`, data);
const deleteEmail  = (id) => axios.delete(`${baseURL}/footer-emails/${id}/`);

// Links
const fetchLinks  = () => axios.get(`${baseURL}/footer-links/`).then(r => r.data);
const createLink  = (data) => axios.post(`${baseURL}/footer-links/`, data);
const updateLink  = ({ id, ...data }) => axios.patch(`${baseURL}/footer-links/${id}/`, data);
const deleteLink  = (id) => axios.delete(`${baseURL}/footer-links/${id}/`);

// ---------- CONSTANTS ----------
const MAX_FILE_SIZE = 1 * 1024 * 1024;

// ---------- MODAL ----------
const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-2xl" }) => {
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
const Field = ({ label, id, value, onChange, placeholder, error, required, type = "text" }) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="text-sm font-medium">
      {label}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      id={id} type={type} value={value} onChange={onChange}
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

const RichTextField = ({ label, value, onChange, editorKey, error, required }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium">
      {label}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <div className={`border rounded-md overflow-visible dark:border-strokedark
      [&_.ck-editor__editable]:min-h-[150px] [&_.ck-editor__editable]:text-sm [&_.ck-editor__editable]:px-4
      [&_.ck-editor__editable]:dark:bg-meta-4 [&_.ck-toolbar]:dark:bg-boxdark [&_.ck-toolbar]:dark:border-strokedark
      [&_.ck-toolbar]:sticky [&_.ck-toolbar]:top-0 [&_.ck-toolbar]:z-10
      ${error ? "border-red-400" : "border-gray-300 dark:border-strokedark"}`}>
      <CKEditor
        key={editorKey}
        editor={ClassicEditor}
        data={value}
        onChange={(_event, editor) => onChange(editor.getData())}
        config={{ toolbar: ["bold","italic","underline","|","bulletedList","numberedList","|","link","|","undo","redo"] }}
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

// ---------- FILE UPLOAD FIELD (logo — accepts svg/png/jpg) ----------
const FileUploadField = ({ label, fieldName, existingUrl, file, onFileChange, onRemove, fileInputRef, required, error }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium">
      {label}{required && <span className="text-red-500 ml-1">*</span>}
      <span className="text-gray-400 font-normal ml-1">(SVG / PNG / JPG, max 1 MB)</span>
    </label>
    {(existingUrl || file) && (
      <div className="relative w-32 h-16 border rounded-md overflow-hidden bg-gray-50 flex items-center justify-center">
        <img
          src={file ? URL.createObjectURL(file) : existingUrl}
          alt={label}
          className="max-h-full max-w-full object-contain"
        />
        <button type="button" onClick={() => onRemove(fieldName)}
          className="absolute top-1 right-1 bg-white rounded-full shadow p-0.5 text-red-500 hover:text-red-700">
          <FiX size={14} />
        </button>
      </div>
    )}
    <input ref={fileInputRef} type="file" accept="image/*,.svg"
      onChange={(e) => onFileChange(e, fieldName)}
      className="text-sm file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-opacity-90 cursor-pointer" />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

// ════════════════════════════════════════════════════
// FOOTER MODAL
// ════════════════════════════════════════════════════
const FooterModal = ({ isOpen, onClose, data }) => {
  const queryClient = useQueryClient();
  const isEdit = !!data;

  const [form, setForm]       = useState(() => ({ description: data?.description || "" }));
  const [logoFile, setLogoFile] = useState(null);
  const [errors, setErrors]   = useState({});
  const logoRef = React.useRef(null);

  React.useEffect(() => {
    setForm({ description: data?.description || "" });
    setLogoFile(null);
    setErrors({});
  }, [data, isOpen]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setErrors((ev) => ({ ...ev, logo: "File must be 2 MB or smaller." }));
      e.target.value = ""; return;
    }
    setLogoFile(file);
    setErrors((ev) => ({ ...ev, logo: "" }));
  };

  const handleRemove = () => {
    setLogoFile(null);
    if (logoRef.current) logoRef.current.value = "";
  };

  const mutation = useMutation({
    mutationFn: saveFooter,
    onSuccess: () => {
      queryClient.invalidateQueries(["footer"]);
      toast.success("Footer updated successfully!");
      onClose();
    },
    onError: () => toast.error("Failed to update footer."),
  });

  const handleSubmit = () => {
    const e = {};
    if (!form.description.replace(/<[^>]*>/g, "").trim()) e.description = "Description is required.";
    if (!isEdit && !logoFile)     e.logo         = "Logo is required.";
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    const fd = new FormData();
    if (data?.id) fd.append("id", data.id);
    fd.append("description", form.description);
    if (logoFile) fd.append("logo", logoFile);
    mutation.mutate(fd);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Edit Footer" : "Setup Footer"} maxWidth="max-w-2xl">
      <div className="flex flex-col gap-4">
        <FileUploadField
          label="Logo" fieldName="logo" required={!isEdit}
          existingUrl={data?.logo} file={logoFile} error={errors.logo}
          onFileChange={handleFileChange} onRemove={handleRemove} fileInputRef={logoRef}
        />
        <RichTextField
          label="Description" required
          value={form.description} error={errors.description}
          editorKey={`footer-desc-${data?.id ?? "new"}-${isOpen}`}
          onChange={(val) => { setForm((f) => ({ ...f, description: val })); setErrors((ev) => ({ ...ev, description: "" })); }}
        />
      </div>
      <ModalActions onClose={onClose} onSubmit={handleSubmit} submitting={mutation.isPending} isEdit={isEdit} />
    </Modal>
  );
};

// ════════════════════════════════════════════════════
// EMAIL MODAL
// ════════════════════════════════════════════════════
const EmailModal = ({ isOpen, onClose, data }) => {
  const queryClient = useQueryClient();
  const isEdit = !!data;
  const [email, setEmail]   = useState(data?.email || "");
  const [error, setError]   = useState("");

  React.useEffect(() => { setEmail(data?.email || ""); setError(""); }, [data, isOpen]);

  const mutation = useMutation({
    mutationFn: isEdit ? updateEmail : createEmail,
    onSuccess: () => { queryClient.invalidateQueries(["footer-emails"]); toast.success(`Email ${isEdit ? "updated" : "added"}!`); onClose(); },
    onError: () => toast.error("Failed to save email."),
  });

  const handleSubmit = () => {
    if (!email.trim()) { setError("Email is required."); return; }
    setError("");
    mutation.mutate(isEdit ? { id: data.id, email } : { email });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Edit Email" : "Add Email"}>
      <div className="flex flex-col gap-4">
        <Field label="Email" id="email" required type="email"
          value={email} error={error}
          onChange={(e) => { setEmail(e.target.value); setError(""); }}
          placeholder="contact@example.com"
        />
      </div>
      <ModalActions onClose={onClose} onSubmit={handleSubmit} submitting={mutation.isPending} isEdit={isEdit} />
    </Modal>
  );
};

// ════════════════════════════════════════════════════
// LINK MODAL
// ════════════════════════════════════════════════════
const LinkModal = ({ isOpen, onClose, data }) => {
  const queryClient = useQueryClient();
  const isEdit = !!data;
  const [form, setForm]     = useState(() => ({ label: data?.label || "", link: data?.link || "" }));
  const [errors, setErrors] = useState({});

  React.useEffect(() => { setForm({ label: data?.label || "", link: data?.link || "" }); setErrors({}); }, [data, isOpen]);

  const set = (key) => (e) => { setForm((f) => ({ ...f, [key]: e.target.value })); setErrors((ev) => ({ ...ev, [key]: "" })); };

  const mutation = useMutation({
    mutationFn: isEdit ? updateLink : createLink,
    onSuccess: () => { queryClient.invalidateQueries(["footer-links"]); toast.success(`Link ${isEdit ? "updated" : "added"}!`); onClose(); },
    onError: () => toast.error("Failed to save link."),
  });

  const handleSubmit = () => {
    const e = {};
    if (!form.label.trim()) e.label = "Label is required.";
    if (!form.link.trim())  e.link  = "Link is required.";
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    mutation.mutate(isEdit ? { id: data.id, ...form } : form);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Edit Link" : "Add Link"}>
      <div className="flex flex-col gap-4">
        <Field label="Label" id="label" required value={form.label} error={errors.label} onChange={set("label")} placeholder="Privacy Policy" />
        <Field label="Link"  id="link"  required value={form.link}  error={errors.link}  onChange={set("link")}  placeholder="/privacy-policy" />
      </div>
      <ModalActions onClose={onClose} onSubmit={handleSubmit} submitting={mutation.isPending} isEdit={isEdit} />
    </Modal>
  );
};

// ════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════
const FooterForm = () => {
  const queryClient = useQueryClient();

  const [footerModalOpen, setFooterModalOpen] = useState(false);
  const [emailModalOpen,  setEmailModalOpen]  = useState(false);
  const [linkModalOpen,   setLinkModalOpen]   = useState(false);
  const [selectedEmail,   setSelectedEmail]   = useState(null);
  const [selectedLink,    setSelectedLink]    = useState(null);

  const { data: footerData, isLoading: loadingFooter } = useQuery({ queryKey: ["footer"],        queryFn: fetchFooter  });
  const { data: emails = [], isLoading: loadingEmails } = useQuery({ queryKey: ["footer-emails"], queryFn: fetchEmails  });
  const { data: links  = [], isLoading: loadingLinks  } = useQuery({ queryKey: ["footer-links"],  queryFn: fetchLinks   });

  const deleteEmailMutation = useMutation({
    mutationFn: deleteEmail,
    onSuccess: () => { queryClient.invalidateQueries(["footer-emails"]); toast.success("Email deleted!"); },
    onError: () => toast.error("Failed to delete email."),
  });

  const deleteLinkMutation = useMutation({
    mutationFn: deleteLink,
    onSuccess: () => { queryClient.invalidateQueries(["footer-links"]); toast.success("Link deleted!"); },
    onError: () => toast.error("Failed to delete link."),
  });

  return (
    <>
      <FooterModal
        key={`footer-${footerData?.id ?? "new"}-${footerModalOpen}`}
        isOpen={footerModalOpen}
        onClose={() => setFooterModalOpen(false)}
        data={footerData}
      />
      <EmailModal
        key={`email-${selectedEmail?.id ?? "new"}-${emailModalOpen}`}
        isOpen={emailModalOpen}
        onClose={() => { setEmailModalOpen(false); setSelectedEmail(null); }}
        data={selectedEmail}
      />
      <LinkModal
        key={`link-${selectedLink?.id ?? "new"}-${linkModalOpen}`}
        isOpen={linkModalOpen}
        onClose={() => { setLinkModalOpen(false); setSelectedLink(null); }}
        data={selectedLink}
      />

      <div className="flex flex-col gap-8">

        {/* ── Footer Info ── */}
        <div className="bg-white dark:bg-boxdark rounded-lg shadow-sm p-6 border border-stroke dark:border-strokedark">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Footer</h2>
            <button onClick={() => setFooterModalOpen(true)}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90 transition">
              <FiEdit /> {footerData ? "Edit" : "Setup"}
            </button>
          </div>
          {loadingFooter ? (
            <p className="text-gray-400 text-sm">Loading...</p>
          ) : !footerData ? (
            <p className="text-gray-400 text-sm">No footer data yet. Click Setup to get started.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {footerData.logo && (
                <div>
                  <p className="text-sm font-medium mb-1.5">Logo</p>
                  <img src={footerData.logo} alt="Footer logo" className="h-12 object-contain" />
                </div>
              )}
              <div>
                <p className="text-sm font-medium mb-1.5">Description</p>
                <div
                  className="ck-content border border-gray-200 dark:border-strokedark rounded-md p-3 text-sm text-gray-700 dark:text-gray-300 text-left [&_*]:text-left"
                  dangerouslySetInnerHTML={{ __html: footerData.description }}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Emails + Links side by side ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Emails */}
          <div className="bg-white dark:bg-boxdark rounded-lg shadow-sm p-6 border border-stroke dark:border-strokedark">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Footer Emails</h2>
              <button onClick={() => { setSelectedEmail(null); setEmailModalOpen(true); }}
                className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90 transition">
                <FiPlus /> Add
              </button>
            </div>
            {loadingEmails ? (
              <p className="text-gray-400 text-sm">Loading...</p>
            ) : emails.length === 0 ? (
              <p className="text-gray-400 text-sm">No emails added yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {emails.map((item) => (
                  <div key={item.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-gray-200 dark:border-strokedark bg-gray-50 dark:bg-meta-4">
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{item.email}</span>
                    <div className="flex gap-2 shrink-0 ml-3">
                      <button onClick={() => { setSelectedEmail(item); setEmailModalOpen(true); }}
                        className="text-blue-500 hover:text-blue-700 p-1 rounded transition" title="Edit">
                        <FiEdit size={14} />
                      </button>
                      <button onClick={() => { if (confirm("Delete this email?")) deleteEmailMutation.mutate(item.id); }}
                        className="text-red-500 hover:text-red-700 p-1 rounded transition" title="Delete"
                        disabled={deleteEmailMutation.isPending}>
                        <FiTrash size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Links */}
          <div className="bg-white dark:bg-boxdark rounded-lg shadow-sm p-6 border border-stroke dark:border-strokedark">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Footer Links</h2>
              <button onClick={() => { setSelectedLink(null); setLinkModalOpen(true); }}
                className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90 transition">
                <FiPlus /> Add
              </button>
            </div>
            {loadingLinks ? (
              <p className="text-gray-400 text-sm">Loading...</p>
            ) : links.length === 0 ? (
              <p className="text-gray-400 text-sm">No links added yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {links.map((item) => (
                  <div key={item.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-gray-200 dark:border-strokedark bg-gray-50 dark:bg-meta-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-sm font-medium text-gray-800 dark:text-white truncate">{item.label}</span>
                      <span className="text-xs text-gray-400 truncate">{item.link}</span>
                    </div>
                    <div className="flex gap-2 shrink-0 ml-3">
                      <button onClick={() => { setSelectedLink(item); setLinkModalOpen(true); }}
                        className="text-blue-500 hover:text-blue-700 p-1 rounded transition" title="Edit">
                        <FiEdit size={14} />
                      </button>
                      <button onClick={() => { if (confirm("Delete this link?")) deleteLinkMutation.mutate(item.id); }}
                        className="text-red-500 hover:text-red-700 p-1 rounded transition" title="Delete"
                        disabled={deleteLinkMutation.isPending}>
                        <FiTrash size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default FooterForm;
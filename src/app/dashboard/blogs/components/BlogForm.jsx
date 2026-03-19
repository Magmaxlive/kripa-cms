"use client";
import React, { useState } from "react";
import axios from "axios";
import { baseURL, authToken } from "@/auth/auth";
import { FiEdit, FiTrash, FiPlus, FiX } from "react-icons/fi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

// ---------- API FUNCTIONS ----------
const authHeaders      = { Authorization: `Bearer ${authToken}` };
const multipartHeaders = { ...authHeaders, "Content-Type": "multipart/form-data" };

const fetchBlogCategories = () => axios.get(`${baseURL}/blog-categories/`).then(r => r.data);
const fetchAuthors        = () => axios.get(`${baseURL}/users/`).then(r => r.data);
const fetchBlogs          = () => axios.get(`${baseURL}/blogs/`).then(r => r.data);

const createBlog = (formData) => axios.post(`${baseURL}/blogs/`, formData, { headers: multipartHeaders });
const updateBlog = (formData) => {
  const id = formData.get("id");
  formData.delete("id");
  return axios.patch(`${baseURL}/blogs/${id}/`, formData, { headers: multipartHeaders });
};
const deleteBlog = (id) => axios.delete(`${baseURL}/blogs/${id}/`, { headers: authHeaders });

// ---------- CONSTANTS ----------
const MAX_IMAGE_SIZE = 1 * 1024 * 1024;

const STATUS_OPTIONS = [
  { value: "draft",     label: "Draft"     },
  { value: "published", label: "Published" },
];

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

const SelectField = ({ label, id, value, onChange, options, error, required, placeholder = "Select…" }) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="text-sm font-medium">
      {label}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <select
      id={id} value={value} onChange={onChange}
      className={`border h-11 w-full rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-meta-4 bg-white dark:bg-meta-4 transition
        ${error ? "border-red-400 focus:ring-red-400" : "border-gray-300 dark:border-strokedark"}`}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

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

// ---------- IMAGE UPLOAD FIELD ----------
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

// ---------- STATUS BADGE ----------
const StatusBadge = ({ status }) => {
  const styles = {
    published: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    draft:     "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  };
  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium capitalize ${styles[status] || styles.draft}`}>
      {status || "draft"}
    </span>
  );
};

// ════════════════════════════════════════════════════
// BLOG MODAL
// ════════════════════════════════════════════════════
const EMPTY_BLOG_FORM = {
  title: "", video_title: "", video_link: "", content: "",
  author: "", category: "", status: "draft",
};

const formFromBlog = (data) =>
  data
    ? {
        title:       data.title       || "",
        video_title: data.video_title || "",
        video_link:  data.video_link  || "",
        content:     data.content     || "",
        author:      data.author      ?? "",
        category:    data.category    ?? "",
        status:      data.status      || "draft",
      }
    : EMPTY_BLOG_FORM;

const BlogModal = ({ isOpen, onClose, data, categories, authors }) => {
  const queryClient = useQueryClient();
  const isEdit = !!data;

  const [form, setForm]     = useState(() => formFromBlog(data));
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});
  const imageRef = React.useRef(null);

  React.useEffect(() => {
    setForm(formFromBlog(data));
    setImageFile(null);
    setErrors({});
  }, [data, isOpen]);

  const set = (key) => (ev) => {
    setForm((f) => ({ ...f, [key]: ev.target.value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((ev) => ({ ...ev, image: "Only image files are allowed." }));
      e.target.value = ""; return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setErrors((ev) => ({ ...ev, image: "Image must be 1 MB or smaller." }));
      e.target.value = ""; return;
    }
    setImageFile(file);
    setErrors((ev) => ({ ...ev, image: "" }));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    if (imageRef.current) imageRef.current.value = "";
  };

  const mutation = useMutation({
    mutationFn: isEdit ? updateBlog : createBlog,
    onSuccess: () => {
      queryClient.invalidateQueries(["blogs"]);
      toast.success(`Blog ${isEdit ? "updated" : "created"} successfully!`);
      onClose();
    },
    onError: () => toast.error(`Failed to ${isEdit ? "update" : "create"} blog.`),
  });

  const validate = () => {
    const e = {};
    if (!form.title.trim())   e.title   = "Title is required.";
    if (!form.author)         e.author  = "Author is required.";
    if (!form.status)         e.status  = "Status is required.";
    if (!form.content.replace(/<[^>]*>/g, "").trim()) e.content = "Content is required.";
    if (!isEdit && !imageFile) e.image  = "Image is required.";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    const fd = new FormData();
    if (isEdit) fd.append("id", data.id);
    Object.entries(form).forEach(([k, v]) => { if (v !== "") fd.append(k, v); });
    if (imageFile) fd.append("image", imageFile);
    mutation.mutate(fd);
  };

  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.title || c.name }));
  const authorOptions   = authors.map((u) => ({
    value: u.id,
    label: u.full_name || u.get_full_name || `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.username || u.email,
  }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Edit Blog" : "Add Blog"} maxWidth="max-w-4xl">
      <div className="flex flex-col gap-4">

        {/* ── Meta ── */}
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Post Details</p>

        <Field label="Title" id="title" required value={form.title} error={errors.title} onChange={set("title")} placeholder="Enter blog title" />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SelectField
            label="Author" id="author" required value={form.author}
            onChange={set("author")} options={authorOptions}
            placeholder="Select author" error={errors.author}
          />
          <SelectField
            label="Category" id="category" value={form.category}
            onChange={set("category")} options={categoryOptions}
            placeholder="No category" error={errors.category}
          />
          <SelectField
            label="Status" id="status" required value={form.status}
            onChange={set("status")} options={STATUS_OPTIONS}
            error={errors.status}
          />
        </div>

        <ImageUploadField
          label="Featured Image" fieldName="image" required={!isEdit}
          existingUrl={data?.image} file={imageFile} error={errors.image}
          onFileChange={handleFileChange} onRemove={handleRemoveImage} fileInputRef={imageRef}
        />

        <hr className="border-gray-200 dark:border-strokedark" />

        {/* ── Content ── */}
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Content</p>

        <RichTextField
          label="Content" required
          value={form.content}
          error={errors.content}
          onChange={(val) => {
            setForm((f) => ({ ...f, content: val }));
            setErrors((e) => ({ ...e, content: "" }));
          }}
          editorKey={`${data?.id ?? "new"}-${isOpen}`}
        />

        <hr className="border-gray-200 dark:border-strokedark" />

        {/* ── Optional video ── */}
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Video (optional)</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Video Title" id="video_title" value={form.video_title}
            onChange={set("video_title")} placeholder="e.g. Watch our overview" error={errors.video_title} />
          <Field label="Video Link" id="video_link" value={form.video_link}
            onChange={set("video_link")} placeholder="https://youtube.com/watch?v=..." error={errors.video_link} />
        </div>

      </div>
      <ModalActions onClose={onClose} onSubmit={handleSubmit} submitting={mutation.isPending} isEdit={isEdit} />
    </Modal>
  );
};

// ════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════
const BlogForm = () => {
  const queryClient = useQueryClient();
  const [blogModalOpen,  setBlogModalOpen]  = useState(false);
  const [selectedBlog,   setSelectedBlog]   = useState(null);
  const [activeCatFilter,    setActiveCatFilter]    = useState("all");
  const [activeStatusFilter, setActiveStatusFilter] = useState("all");

  const { data: categories = [] } = useQuery({ queryKey: ["blog-categories"], queryFn: fetchBlogCategories });
  const { data: authors    = [] } = useQuery({ queryKey: ["blog-authors"],    queryFn: fetchAuthors });
  const { data: blogs      = [], isLoading } = useQuery({ queryKey: ["blogs"], queryFn: fetchBlogs });

  const deleteMutation = useMutation({
    mutationFn: deleteBlog,
    onSuccess: () => { queryClient.invalidateQueries(["blogs"]); toast.success("Blog deleted successfully!"); },
    onError: () => toast.error("Failed to delete blog."),
  });

  const categoryMap = React.useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.title || c.name])),
    [categories]
  );

  const authorMap = React.useMemo(
    () => Object.fromEntries(authors.map((u) => [
      u.id,
      u.full_name || `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.username || u.email,
    ])),
    [authors]
  );

  const filteredBlogs = React.useMemo(() => {
    let result = blogs;
    // category filter
    if (activeCatFilter === "none") result = result.filter((b) => !b.category);
    else if (activeCatFilter !== "all") result = result.filter((b) => String(b.category) === String(activeCatFilter));
    // status filter
    if (activeStatusFilter !== "all") result = result.filter((b) => b.status === activeStatusFilter);
    return result;
  }, [blogs, activeCatFilter, activeStatusFilter]);

  const handleEdit   = (item) => { setSelectedBlog(item); setBlogModalOpen(true); };
  const handleAdd    = ()     => { setSelectedBlog(null);  setBlogModalOpen(true); };
  const handleDelete = (id)   => { if (confirm("Are you sure you want to delete this blog post?")) deleteMutation.mutate(id); };

  return (
    <>
      <BlogModal
        key={`${selectedBlog?.id ?? "new"}-${blogModalOpen}`}
        isOpen={blogModalOpen}
        onClose={() => { setBlogModalOpen(false); setSelectedBlog(null); }}
        data={selectedBlog}
        categories={categories}
        authors={authors}
      />

      <div className="bg-white dark:bg-boxdark rounded-lg shadow-sm p-6 border border-stroke dark:border-strokedark">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Blog Posts</h2>
          <button onClick={handleAdd}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90 transition">
            <FiPlus /> Add Blog
          </button>
        </div>

        {/* ── Filters ── */}
        <div className="flex flex-col gap-3 mb-6">

          {/* Category filter */}
          {categories.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-400 font-medium mr-1">Category:</span>
              {[{ id: "all", title: "All" }, ...categories, { id: "none", title: "Uncategorised" }].map((cat) => (
                <button key={cat.id}
                  onClick={() => setActiveCatFilter(String(cat.id))}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition
                    ${String(activeCatFilter) === String(cat.id)
                      ? "bg-primary text-white border-primary"
                      : "bg-white dark:bg-meta-4 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-strokedark hover:border-primary hover:text-primary"}`}>
                  {cat.title}
                </button>
              ))}
            </div>
          )}

          {/* Status filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-400 font-medium mr-1">Status:</span>
            {[{ value: "all", label: "All" }, ...STATUS_OPTIONS].map((opt) => (
              <button key={opt.value}
                onClick={() => setActiveStatusFilter(opt.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition
                  ${activeStatusFilter === opt.value
                    ? "bg-primary text-white border-primary"
                    : "bg-white dark:bg-meta-4 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-strokedark hover:border-primary hover:text-primary"}`}>
                {opt.label}
              </button>
            ))}
          </div>

        </div>

        {/* ── Grid ── */}
        {isLoading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : filteredBlogs.length === 0 ? (
          <p className="text-gray-400 text-sm">{blogs.length === 0 ? "No blog posts yet." : "No posts match the selected filters."}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBlogs.map((item) => (
              <div key={item.id}
                className="group relative rounded-xl overflow-hidden border border-gray-200 dark:border-strokedark shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-meta-4">

                {/* Image */}
                <div className="relative h-44 w-full bg-gray-100 dark:bg-gray-800">
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-300 text-xs">No image</div>
                  )}

                  {/* Category badge */}
                  {item.category && (
                    <span className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
                      {categoryMap[item.category] || "—"}
                    </span>
                  )}

                  {/* Edit / Delete */}
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(item)}
                      className="bg-white text-blue-500 hover:text-blue-700 p-1.5 rounded-full shadow" title="Edit">
                      <FiEdit size={14} />
                    </button>
                    <button onClick={() => handleDelete(item.id)}
                      className="bg-white text-red-500 hover:text-red-700 p-1.5 rounded-full shadow" title="Delete"
                      disabled={deleteMutation.isPending}>
                      <FiTrash size={14} />
                    </button>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <StatusBadge status={item.status} />
                    {item.created_at && (
                      <span className="text-xs text-gray-400">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm text-gray-800 dark:text-white line-clamp-2 leading-snug">{item.title || "—"}</h3>
                  {item.author && (
                    <p className="text-xs text-gray-400">by {authorMap[item.author] || "—"}</p>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default BlogForm;
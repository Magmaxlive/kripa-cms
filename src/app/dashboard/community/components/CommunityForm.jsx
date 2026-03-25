"use client";
import React, { useState, useRef } from "react";
import axios from "axios";
import { baseURL } from "@/auth/auth";
import { FiEdit, FiTrash, FiPlus, FiX, FiImage } from "react-icons/fi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

// ─────────────────────────────────────────────
// API
// ─────────────────────────────────────────────
const fetchSection    = () => axios.get(`${baseURL}/community-section/`).then(r => Array.isArray(r.data) ? r.data[0] || null : r.data || null);
const saveSection     = (fd) => { const id = fd.get("id"); fd.delete("id"); return id ? axios.patch(`${baseURL}/community-section/${id}/`, fd) : axios.post(`${baseURL}/community-section/`, fd); };

const fetchCounters   = () => axios.get(`${baseURL}/community-counters/`).then(r => r.data);
const createCounter   = (d) => axios.post(`${baseURL}/community-counters/`, d);
const updateCounter   = ({ id, ...d }) => axios.patch(`${baseURL}/community-counters/${id}/`, d);
const deleteCounter   = (id) => axios.delete(`${baseURL}/community-counters/${id}/`);

const fetchCategories = () => axios.get(`${baseURL}/event-categories/`).then(r => r.data);
const createCategory  = (d) => axios.post(`${baseURL}/event-categories/`, d);
const updateCategory  = ({ id, ...d }) => axios.patch(`${baseURL}/event-categories/${id}/`, d);
const deleteCategory  = (id) => axios.delete(`${baseURL}/event-categories/${id}/`);

const fetchEvents     = () => axios.get(`${baseURL}/events/`).then(r => r.data);
const createEvent     = (fd) => axios.post(`${baseURL}/events/`, fd);
const updateEvent     = ({ id, fd }) => axios.patch(`${baseURL}/events/${id}/`, fd);
const deleteEvent     = (id) => axios.delete(`${baseURL}/events/${id}/`);

const fetchImages     = (eventId) => axios.get(`${baseURL}/event-images/?event=${eventId}`).then(r => r.data);
const uploadImage     = (fd) => axios.post(`${baseURL}/event-images/`, fd);
const deleteImage     = (id) => axios.delete(`${baseURL}/event-images/${id}/`);

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────
const MAX_SIZE = 1 * 1024 * 1024;

// ─────────────────────────────────────────────
// SHARED UI
// ─────────────────────────────────────────────
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

const Field = ({ label, id, value, onChange, placeholder, error, required, type = "text" }) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="text-sm font-medium">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
    <input id={id} type={type} value={value} onChange={onChange} placeholder={placeholder || `Enter ${label}`}
      className={`border h-11 w-full rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-meta-4 transition ${error ? "border-red-400" : "border-gray-300 dark:border-strokedark"}`} />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

const TextareaField = ({ label, id, value, onChange, placeholder, rows = 3, error, required }) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="text-sm font-medium">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
    <textarea id={id} value={value} onChange={onChange} placeholder={placeholder} rows={rows}
      className={`border w-full rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-meta-4 resize-none transition ${error ? "border-red-400" : "border-gray-300 dark:border-strokedark"}`} />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

const ToggleField = ({ label, checked, onChange, description }) => (
  <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-strokedark">
    <div><p className="text-sm font-medium">{label}</p>{description && <p className="text-xs text-gray-400">{description}</p>}</div>
    <button type="button" onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  </div>
);

const SelectField = ({ label, id, value, onChange, options, error, required }) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="text-sm font-medium">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
    <select id={id} value={value} onChange={onChange}
      className={`border h-11 w-full rounded-md px-3 bg-white dark:bg-meta-4 focus:outline-none focus:ring-2 focus:ring-primary transition ${error ? "border-red-400" : "border-gray-300 dark:border-strokedark"}`}>
      <option value="">— Select —</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

const ImageUploadField = ({ label, existingUrl, file, onFileChange, onRemove, fileInputRef, required, error }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium">{label}{required && <span className="text-red-500 ml-1">*</span>}<span className="text-gray-400 font-normal ml-1">(max 1 MB)</span></label>
    {(existingUrl || file) && (
      <div className="relative w-40 h-24 border rounded-md overflow-hidden bg-gray-50 flex items-center justify-center">
        <img src={file ? URL.createObjectURL(file) : existingUrl} alt={label} className="max-h-full max-w-full object-cover" />
        <button type="button" onClick={onRemove} className="absolute top-1 right-1 bg-white rounded-full shadow p-0.5 text-red-500 hover:text-red-700"><FiX size={14} /></button>
      </div>
    )}
    <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileChange}
      className="text-sm file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-opacity-90 cursor-pointer" />
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
  <div className="flex flex-col gap-1">
    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</p>
    <p className="text-sm border border-gray-200 p-4 text-gray-800 rounded-md dark:text-white">{value || "—"}</p>
  </div>
);

// ─────────────────────────────────────────────
// SECTION MODAL
// ─────────────────────────────────────────────
const SectionModal = ({ isOpen, onClose, data }) => {
  const qc = useQueryClient();
  const isEdit = !!data;
  const [form, setForm] = useState({ minor_heading: data?.minor_heading || "", paragraph: data?.paragraph || "" });
  const [bannerFile, setBannerFile] = useState(null);
  const [errors, setErrors] = useState({});
  const bannerRef = useRef(null);

  React.useEffect(() => { setForm({ minor_heading: data?.minor_heading || "", paragraph: data?.paragraph || "" }); setBannerFile(null); setErrors({}); }, [data, isOpen]);

  const set = (k) => (e) => { setForm(f => ({ ...f, [k]: e.target.value })); setErrors(ev => ({ ...ev, [k]: "" })); };

  const handleFile = (e) => {
    const f = e.target.files[0]; if (!f) return;
    if (f.size > MAX_SIZE) { setErrors(ev => ({ ...ev, banner_image: "Max 1 MB." })); e.target.value = ""; return; }
    setBannerFile(f); setErrors(ev => ({ ...ev, banner_image: "" }));
  };

  const mutation = useMutation({
    mutationFn: saveSection,
    onSuccess: () => { qc.invalidateQueries(["community-section"]); toast.success("Section updated!"); onClose(); },
    onError: () => toast.error("Failed to save section."),
  });

  const handleSubmit = () => {
    const e = {};
    if (!form.minor_heading.trim()) e.minor_heading = "Required.";
    if (!form.paragraph.trim())     e.paragraph     = "Required.";
    if (Object.keys(e).length) { setErrors(e); return; }
    const fd = new FormData();
    if (data?.id) fd.append("id", data.id);
    fd.append("minor_heading", form.minor_heading);
    fd.append("paragraph", form.paragraph);
    if (bannerFile) fd.append("banner_image", bannerFile);
    mutation.mutate(fd);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Edit Page Section" : "Setup Page Section"}>
      <div className="flex flex-col gap-4">
        <ImageUploadField label="Banner Image" existingUrl={data?.banner_image} file={bannerFile}
          onFileChange={handleFile} onRemove={() => { setBannerFile(null); if (bannerRef.current) bannerRef.current.value = ""; }}
          fileInputRef={bannerRef} error={errors.banner_image} />
        <Field label="Minor Heading" id="minor_heading" required value={form.minor_heading} error={errors.minor_heading} onChange={set("minor_heading")} placeholder="kripa in the community" />
        <TextareaField label="Paragraph" id="paragraph" required value={form.paragraph} error={errors.paragraph} onChange={set("paragraph")} rows={3} />
      </div>
      <ModalActions onClose={onClose} onSubmit={handleSubmit} submitting={mutation.isPending} isEdit={isEdit} />
    </Modal>
  );
};

// ─────────────────────────────────────────────
// COUNTER MODAL
// ─────────────────────────────────────────────
const CounterModal = ({ isOpen, onClose, data }) => {
  const qc = useQueryClient();
  const isEdit = !!data;
  const [form, setForm] = useState({ number: data?.number || "", label: data?.label || "", order: data?.order ?? 0 });
  const [errors, setErrors] = useState({});

  React.useEffect(() => { setForm({ number: data?.number || "", label: data?.label || "", order: data?.order ?? 0 }); setErrors({}); }, [data, isOpen]);

  const set = (k) => (e) => { setForm(f => ({ ...f, [k]: e.target.value })); setErrors(ev => ({ ...ev, [k]: "" })); };

  const mutation = useMutation({
    mutationFn: isEdit ? updateCounter : createCounter,
    onSuccess: () => { qc.invalidateQueries(["community-counters"]); toast.success(`Counter ${isEdit ? "updated" : "added"}!`); onClose(); },
    onError: () => toast.error("Failed to save counter."),
  });

  const handleSubmit = () => {
    const e = {};
    if (!form.number.trim()) e.number = "Required.";
    if (!form.label.trim())  e.label  = "Required.";
    if (Object.keys(e).length) { setErrors(e); return; }
    const payload = { number: form.number, label: form.label, order: Number(form.order) || 0 };
    mutation.mutate(isEdit ? { id: data.id, ...payload } : payload);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Edit Counter" : "Add Counter"} maxWidth="max-w-md">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Number" id="number" required value={form.number} error={errors.number} onChange={set("number")} placeholder="48+" />
          <Field label="Label"  id="label"  required value={form.label}  error={errors.label}  onChange={set("label")}  placeholder="Events Hosted" />
        </div>
        <Field label="Order" id="order" value={String(form.order)} onChange={set("order")} placeholder="0" />
      </div>
      <ModalActions onClose={onClose} onSubmit={handleSubmit} submitting={mutation.isPending} isEdit={isEdit} />
    </Modal>
  );
};

// ─────────────────────────────────────────────
// CATEGORY MODAL
// ─────────────────────────────────────────────
const CategoryModal = ({ isOpen, onClose, data }) => {
  const qc = useQueryClient();
  const isEdit = !!data;
  const [name, setName] = useState(data?.name || "");
  const [error, setError] = useState("");

  React.useEffect(() => { setName(data?.name || ""); setError(""); }, [data, isOpen]);

  const mutation = useMutation({
    mutationFn: isEdit ? updateCategory : createCategory,
    onSuccess: () => { qc.invalidateQueries(["event-categories"]); toast.success(`Category ${isEdit ? "updated" : "added"}!`); onClose(); },
    onError: () => toast.error("Failed to save category."),
  });

  const handleSubmit = () => {
    if (!name.trim()) { setError("Required."); return; }
    mutation.mutate(isEdit ? { id: data.id, name } : { name });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Edit Category" : "Add Category"} maxWidth="max-w-md">
      <Field label="Category Name" id="name" required value={name} error={error}
        onChange={(e) => { setName(e.target.value); setError(""); }} placeholder="Education" />
      <ModalActions onClose={onClose} onSubmit={handleSubmit} submitting={mutation.isPending} isEdit={isEdit} />
    </Modal>
  );
};

// ─────────────────────────────────────────────
// EVENT IMAGES MODAL
// ─────────────────────────────────────────────
const EventImagesModal = ({ isOpen, onClose, event }) => {
  const qc = useQueryClient();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const { data: images = [], isLoading } = useQuery({
    queryKey: ["event-images", event?.id],
    queryFn:  () => fetchImages(event?.id),
    enabled:  !!event?.id && isOpen,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteImage,
    onSuccess: () => { qc.invalidateQueries(["event-images", event?.id]); toast.success("Image deleted!"); },
    onError: () => toast.error("Failed to delete image."),
  });

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const oversized = files.filter(f => f.size > MAX_SIZE);
    if (oversized.length) { toast.error(`${oversized.length} file(s) exceed 1 MB limit.`); return; }
    setUploading(true);
    try {
      await Promise.all(files.map(file => {
        const fd = new FormData();
        fd.append("event", event.id);
        fd.append("image", file);
        return uploadImage(fd);
      }));
      qc.invalidateQueries(["event-images", event?.id]);
      toast.success(`${files.length} image(s) uploaded!`);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch {
      toast.error("Some uploads failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Gallery — ${event?.title}`} maxWidth="max-w-3xl">
      <div className="flex flex-col gap-5">
        {/* Upload */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Upload Images <span className="text-gray-400 font-normal">(multiple allowed, max 1 MB each)</span></label>
          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleUpload}
            className="text-sm file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-opacity-90 cursor-pointer" />
          {uploading && <p className="text-xs text-primary">Uploading...</p>}
        </div>

        {/* Grid */}
        {isLoading ? (
          <p className="text-sm text-gray-400">Loading images...</p>
        ) : images.length === 0 ? (
          <p className="text-sm text-gray-400">No images uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {images.map(img => (
              <div key={img.id} className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-strokedark" style={{ height: "100px" }}>
                <img src={img.image} alt="event" className="w-full h-full object-cover" />
                <button onClick={() => { if (confirm("Delete this image?")) deleteMutation.mutate(img.id); }}
                  className="absolute top-1 right-1 bg-white rounded-full shadow p-0.5 text-red-500 hover:text-red-700">
                  <FiX size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex justify-end mt-6">
        <button onClick={onClose} className="px-4 py-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 transition">Close</button>
      </div>
    </Modal>
  );
};

// ─────────────────────────────────────────────
// EVENT MODAL
// ─────────────────────────────────────────────
const EventModal = ({ isOpen, onClose, data, categoryOptions }) => {
  const qc = useQueryClient();
  const isEdit = !!data;
  const [form, setForm] = useState({
    title: data?.title || "", date: data?.date || "", location: data?.location || "",
    description: data?.description || "", category: data?.category || "",
    link: data?.link || "", is_featured: data?.is_featured ?? false, is_active: data?.is_active ?? true,
  });
  const [coverFile, setCoverFile] = useState(null);
  const [errors, setErrors] = useState({});
  const coverRef = useRef(null);

  React.useEffect(() => {
    setForm({
      title: data?.title || "", date: data?.date || "", location: data?.location || "",
      description: data?.description || "", category: data?.category || "",
      link: data?.link || "", is_featured: data?.is_featured ?? false, is_active: data?.is_active ?? true,
    });
    setCoverFile(null); setErrors({});
  }, [data, isOpen]);

  const set = (k) => (e) => { setForm(f => ({ ...f, [k]: e.target.value })); setErrors(ev => ({ ...ev, [k]: "" })); };

  const handleFile = (e) => {
    const f = e.target.files[0]; if (!f) return;
    if (f.size > MAX_SIZE) { setErrors(ev => ({ ...ev, cover_image: "Max 1 MB." })); e.target.value = ""; return; }
    setCoverFile(f); setErrors(ev => ({ ...ev, cover_image: "" }));
  };

  const mutation = useMutation({
    mutationFn: isEdit ? updateEvent : createEvent,
    onSuccess: () => { qc.invalidateQueries(["events"]); toast.success(`Event ${isEdit ? "updated" : "created"}!`); onClose(); },
    onError: () => toast.error("Failed to save event."),
  });

  const handleSubmit = () => {
    const e = {};
    if (!form.title.trim())       e.title    = "Required.";
    if (!form.date)                e.date     = "Required.";
    if (!form.location.trim())    e.location  = "Required.";
    if (!form.description.trim()) e.description = "Required.";
    if (!isEdit && !coverFile)    e.cover_image = "Cover image required.";
    if (Object.keys(e).length) { setErrors(e); return; }
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (coverFile) fd.append("cover_image", coverFile);
    mutation.mutate(isEdit ? { id: data.id, fd } : fd);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Edit Event" : "Add Event"} maxWidth="max-w-3xl">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Title" id="title" required value={form.title} error={errors.title} onChange={set("title")} placeholder="Financial Planning Workshop" />
          <Field label="Date" id="date" required type="date" value={form.date} error={errors.date} onChange={set("date")} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Location" id="location" required value={form.location} error={errors.location} onChange={set("location")} placeholder="Auckland" />
          <SelectField label="Category" id="category" value={String(form.category)} onChange={set("category")}
            options={categoryOptions.map(c => ({ value: c.id, label: c.name }))} />
        </div>
        <TextareaField label="Description" id="description" required value={form.description} error={errors.description} onChange={set("description")} rows={3} />
        <Field label="Link (optional)" id="link" value={form.link} onChange={set("link")} placeholder="https://..." />
        <ImageUploadField label="Cover Image" required={!isEdit} existingUrl={data?.cover_image} file={coverFile}
          onFileChange={handleFile} onRemove={() => { setCoverFile(null); if (coverRef.current) coverRef.current.value = ""; }}
          fileInputRef={coverRef} error={errors.cover_image} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ToggleField label="Featured" description="Show in featured spotlight" checked={form.is_featured} onChange={(v) => setForm(f => ({ ...f, is_featured: v }))} />
          <ToggleField label="Active"   description="Show on the frontend"        checked={form.is_active}   onChange={(v) => setForm(f => ({ ...f, is_active: v }))} />
        </div>
      </div>
      <ModalActions onClose={onClose} onSubmit={handleSubmit} submitting={mutation.isPending} isEdit={isEdit} />
    </Modal>
  );
};

// ─────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────
const CommunityForm = () => {
  const qc = useQueryClient();

  const [sectionModal,  setSectionModal]  = useState(false);
  const [counterModal,  setCounterModal]  = useState(false);
  const [categoryModal, setCategoryModal] = useState(false);
  const [eventModal,    setEventModal]    = useState(false);
  const [imagesModal,   setImagesModal]   = useState(false);

  const [selectedCounter,  setSelectedCounter]  = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedEvent,    setSelectedEvent]    = useState(null);
  const [selectedImgEvent, setSelectedImgEvent] = useState(null);

  const { data: section,    isLoading: loadingSection    } = useQuery({ queryKey: ["community-section"],   queryFn: fetchSection    });
  const { data: counters,   isLoading: loadingCounters   } = useQuery({ queryKey: ["community-counters"],  queryFn: fetchCounters   });
  const { data: categories, isLoading: loadingCategories } = useQuery({ queryKey: ["event-categories"],    queryFn: fetchCategories });
  const { data: events,     isLoading: loadingEvents     } = useQuery({ queryKey: ["events"],              queryFn: fetchEvents     });

  const delCounter  = useMutation({ mutationFn: deleteCounter,  onSuccess: () => { qc.invalidateQueries(["community-counters"]); toast.success("Counter deleted!");  }, onError: () => toast.error("Failed.") });
  const delCategory = useMutation({ mutationFn: deleteCategory, onSuccess: () => { qc.invalidateQueries(["event-categories"]);  toast.success("Category deleted!"); }, onError: () => toast.error("Failed.") });
  const delEvent    = useMutation({ mutationFn: deleteEvent,    onSuccess: () => { qc.invalidateQueries(["events"]);            toast.success("Event deleted!");    }, onError: () => toast.error("Failed.") });

  const categoryOptions = categories || [];

  return (
    <>
      {/* Modals */}
      <SectionModal  key={`sec-${section?.id}-${sectionModal}`}   isOpen={sectionModal}  onClose={() => setSectionModal(false)}  data={section} />
      <CounterModal  key={`cnt-${selectedCounter?.id}-${counterModal}`}  isOpen={counterModal}  onClose={() => { setCounterModal(false);  setSelectedCounter(null);  }} data={selectedCounter}  />
      <CategoryModal key={`cat-${selectedCategory?.id}-${categoryModal}`} isOpen={categoryModal} onClose={() => { setCategoryModal(false); setSelectedCategory(null); }} data={selectedCategory} />
      <EventModal    key={`evt-${selectedEvent?.id}-${eventModal}`}    isOpen={eventModal}    onClose={() => { setEventModal(false);    setSelectedEvent(null);    }} data={selectedEvent}    categoryOptions={categoryOptions} />
      <EventImagesModal isOpen={imagesModal} onClose={() => { setImagesModal(false); setSelectedImgEvent(null); }} event={selectedImgEvent} />

      <div className="flex flex-col gap-8">

        {/* ── Page Section ── */}
        <div className="bg-white dark:bg-boxdark rounded-lg shadow-sm p-6 border border-stroke dark:border-strokedark">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Community Page Section</h2>
            <button onClick={() => setSectionModal(true)} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90 transition">
              <FiEdit /> {section ? "Edit" : "Setup"}
            </button>
          </div>
          {loadingSection ? <p className="text-gray-400 text-sm">Loading...</p>
            : !section ? <p className="text-gray-400 text-sm">No section set up yet.</p>
            : (
              <div className="flex flex-col gap-4">
                {section.banner_image && (
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">Banner</p>
                    <img src={section.banner_image} alt="banner" className="h-24 rounded-md object-cover border border-gray-200 dark:border-strokedark" />
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DisplayField label="Minor Heading" value={section.minor_heading} />
                  <DisplayField label="Paragraph"     value={section.paragraph}     />
                </div>
              </div>
            )}
        </div>

        {/* ── Counters + Categories side by side ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Counters */}
          <div className="bg-white dark:bg-boxdark rounded-lg shadow-sm p-6 border border-stroke dark:border-strokedark">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Counters</h2>
              <button onClick={() => { setSelectedCounter(null); setCounterModal(true); }} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90 transition">
                <FiPlus /> Add
              </button>
            </div>
            {loadingCounters ? <p className="text-gray-400 text-sm">Loading...</p>
              : !counters?.length ? <p className="text-gray-400 text-sm">No counters yet.</p>
              : (
                <div className="flex flex-col gap-2">
                  {counters.map(c => (
                    <div key={c.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-gray-200 dark:border-strokedark bg-gray-50 dark:bg-meta-4">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-primary">{c.number}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-300">{c.label}</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { setSelectedCounter(c); setCounterModal(true); }} className="text-blue-500 hover:text-blue-700 p-1 rounded transition"><FiEdit size={14} /></button>
                        <button onClick={() => { if (confirm("Delete?")) delCounter.mutate(c.id); }} className="text-red-500 hover:text-red-700 p-1 rounded transition"><FiTrash size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>

          {/* Categories */}
          <div className="bg-white dark:bg-boxdark rounded-lg shadow-sm p-6 border border-stroke dark:border-strokedark">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Event Categories</h2>
              <button onClick={() => { setSelectedCategory(null); setCategoryModal(true); }} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90 transition">
                <FiPlus /> Add
              </button>
            </div>
            {loadingCategories ? <p className="text-gray-400 text-sm">Loading...</p>
              : !categories?.length ? <p className="text-gray-400 text-sm">No categories yet.</p>
              : (
                <div className="flex flex-col gap-2">
                  {categories.map(c => (
                    <div key={c.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-gray-200 dark:border-strokedark bg-gray-50 dark:bg-meta-4">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{c.name}</span>
                      <div className="flex gap-2">
                        <button onClick={() => { setSelectedCategory(c); setCategoryModal(true); }} className="text-blue-500 hover:text-blue-700 p-1 rounded transition"><FiEdit size={14} /></button>
                        <button onClick={() => { if (confirm("Delete?")) delCategory.mutate(c.id); }} className="text-red-500 hover:text-red-700 p-1 rounded transition"><FiTrash size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>

        </div>

        {/* ── Events ── */}
        <div className="bg-white dark:bg-boxdark rounded-lg shadow-sm p-6 border border-stroke dark:border-strokedark">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Events</h2>
            <button onClick={() => { setSelectedEvent(null); setEventModal(true); }} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90 transition">
              <FiPlus /> Add Event
            </button>
          </div>
          {loadingEvents ? <p className="text-gray-400 text-sm">Loading...</p>
            : !events?.length ? <p className="text-gray-400 text-sm">No events yet.</p>
            : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-strokedark">
                      <th className="text-left py-3 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Cover</th>
                      <th className="text-left py-3 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Title</th>
                      <th className="text-left py-3 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Category</th>
                      <th className="text-left py-3 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                      <th className="text-left py-3 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Location</th>
                      <th className="text-left py-3 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="text-right py-3 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-strokedark">
                    {events.map(ev => (
                      <tr key={ev.id} className="hover:bg-gray-50 dark:hover:bg-meta-4 transition-colors">
                        <td className="py-3 px-3">
                          {ev.cover_image
                            ? <img src={ev.cover_image} alt={ev.title} className="w-12 h-8 object-cover rounded" />
                            : <div className="w-12 h-8 bg-gray-100 dark:bg-meta-4 rounded flex items-center justify-center"><FiImage size={14} className="text-gray-400" /></div>
                          }
                        </td>
                        <td className="py-3 px-3 font-medium text-gray-800 dark:text-white max-w-[150px] truncate">{ev.title}</td>
                        <td className="py-3 px-3 text-gray-500 capitalize">{ev.category_name || "—"}</td>
                        <td className="py-3 px-3 text-gray-500 text-xs">{ev.date}</td>
                        <td className="py-3 px-3 text-gray-500 text-xs">{ev.location}</td>
                        <td className="py-3 px-3">
                          <div className="flex flex-col gap-1">
                            {ev.is_featured && <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 w-fit">Featured</span>}
                            <span className={`text-xs px-2 py-0.5 rounded-full w-fit ${ev.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                              {ev.is_active ? "Active" : "Hidden"}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex justify-end gap-1">
                            <button onClick={() => { setSelectedImgEvent(ev); setImagesModal(true); }}
                              className="text-gray-500 hover:text-purple-500 p-1.5 rounded transition" title="Manage gallery">
                              <FiImage size={14} />
                            </button>
                            <button onClick={() => { setSelectedEvent(ev); setEventModal(true); }}
                              className="text-blue-500 hover:text-blue-700 p-1.5 rounded transition" title="Edit">
                              <FiEdit size={14} />
                            </button>
                            <button onClick={() => { if (confirm("Delete this event?")) delEvent.mutate(ev.id); }}
                              className="text-red-500 hover:text-red-700 p-1.5 rounded transition" title="Delete">
                              <FiTrash size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </div>

      </div>
    </>
  );
};

export default CommunityForm;
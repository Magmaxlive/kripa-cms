"use client";
import React, { useState } from "react";
import axios from "axios";
import { baseURL } from "@/auth/auth";
import { FiEdit, FiTrash, FiPlus, FiX, FiStar } from "react-icons/fi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

// ─────────────────────────────────────────────
// API
// ─────────────────────────────────────────────

const fetchSection      = () => axios.get(`${baseURL}/testimonials-section/`).then(r => r.data);
const saveSection       = ({ id, ...data }) =>
  id ? axios.patch(`${baseURL}/testimonials-section/${id}/`, data)
     : axios.post(`${baseURL}/testimonials-section/`, data);

const fetchTestimonials  = () => axios.get(`${baseURL}/testimonials/`).then(r => r.data);
const createTestimonial  = (data) => axios.post(`${baseURL}/testimonials/`, data);
const updateTestimonial  = ({ id, ...data }) => axios.patch(`${baseURL}/testimonials/${id}/`,data);
const deleteTestimonial  = (id) => axios.delete(`${baseURL}/testimonials/${id}/`);

const fetchMembers       = () => axios.get(`${baseURL}/accredited-members/`).then(r => r.data);
const createMember       = (data) => axios.post(`${baseURL}/accredited-members/`, data);
const updateMember       = ({ id, ...data }) => axios.patch(`${baseURL}/accredited-members/${id}/`,data);
const deleteMember       = (id) => axios.delete(`${baseURL}/accredited-members/${id}/`);

// ─────────────────────────────────────────────
// SHARED UI
// ─────────────────────────────────────────────
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" style={{ zIndex: 9999 }}>
      <div className="bg-white dark:bg-boxdark rounded-lg shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={{ zIndex: 10000 }}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><FiX size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
};

const Field = ({ label, id, value, onChange, placeholder, error }) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="text-sm font-medium">{label}</label>
    <input
      id={id} type="text" value={value} onChange={onChange}
      placeholder={placeholder || `Enter ${label}`}
      className={`border h-11 w-full rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-meta-4 transition
        ${error ? "border-red-400 focus:ring-red-400" : "border-gray-300 dark:border-strokedark"}`}
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

const TextareaField = ({ label, id, value, onChange, placeholder, rows = 3, error }) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="text-sm font-medium">{label}</label>
    <textarea
      id={id} value={value} onChange={onChange} placeholder={placeholder} rows={rows}
      className={`border w-full rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-meta-4 resize-none transition
        ${error ? "border-red-400 focus:ring-red-400" : "border-gray-300 dark:border-strokedark"}`}
    />
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
  <div className="flex flex-col gap-1.5 w-full">
    <label className="text-sm font-medium">{label}</label>
    <p className="border min-h-11 w-full rounded-md p-3 border-gray-300 text-sm text-gray-700 dark:text-gray-300 dark:border-strokedark">
      {value || "—"}
    </p>
  </div>
);

const SectionCard = ({ title, onEdit, loading, children }) => (
  <div className="bg-white dark:bg-boxdark rounded-lg shadow-sm p-6 border border-stroke dark:border-strokedark">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      <button onClick={onEdit} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90 transition">
        <FiEdit size={14} /> Edit
      </button>
    </div>
    {loading ? <p className="text-gray-400 text-sm">Loading...</p> : children}
  </div>
);

const ListCard = ({ title, onAdd, loading, empty, emptyText, children }) => (
  <div className="bg-white dark:bg-boxdark rounded-lg shadow-sm p-6 border border-stroke dark:border-strokedark">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-semibold">{title}</h2>
      <button onClick={onAdd} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90 transition">
        <FiPlus size={14} /> Add
      </button>
    </div>
    {loading ? <p className="text-gray-400 text-sm">Loading...</p>
      : empty  ? <p className="text-gray-400 text-sm">{emptyText || "Nothing added yet."}</p>
      : children}
  </div>
);

// Star rating display
const StarRating = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map(s => (
      <FiStar
        key={s}
        size={13}
        className={s <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
      />
    ))}
  </div>
);

// Interactive star picker for the modal
const StarPicker = ({ value, onChange, error }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium">Rating <span className="text-red-500">*</span></label>
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map(s => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          className="focus:outline-none"
        >
          <FiStar
            size={24}
            className={`transition-colors ${s <= value ? "text-yellow-400 fill-yellow-400" : "text-gray-300 hover:text-yellow-300"}`}
          />
        </button>
      ))}
    </div>
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

// ─────────────────────────────────────────────
// SECTION MODAL
// ─────────────────────────────────────────────
const SectionModal = ({ isOpen, onClose, data }) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(() => ({
    minor_heading: data?.minor_heading || "",
    main_heading:  data?.main_heading  || "",
  }));
  const [errors, setErrors] = useState({});

  React.useEffect(() => {
    setForm({ minor_heading: data?.minor_heading || "", main_heading: data?.main_heading || "" });
    setErrors({});
  }, [data]);

  const mutation = useMutation({
    mutationFn: saveSection,
    onSuccess: () => { queryClient.invalidateQueries(["testimonials-section"]); toast.success("Section updated!"); onClose(); },
    onError:   () => toast.error("Failed to update section."),
  });

  const validate = () => {
    const e = {};
    if (!form.minor_heading.trim()) e.minor_heading = "Minor heading is required.";
    if (!form.main_heading.trim())  e.main_heading  = "Main heading is required.";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    mutation.mutate({ id: data?.id, ...form });
  };

  const set = (key) => (ev) => {
    setForm(f => ({ ...f, [key]: ev.target.value }));
    setErrors(e => ({ ...e, [key]: "" }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Testimonials Section">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Minor Heading" id="minor_heading" value={form.minor_heading} onChange={set("minor_heading")} placeholder="What Our Clients Say" error={errors.minor_heading} />
          <Field label="Main Heading"  id="main_heading"  value={form.main_heading}  onChange={set("main_heading")}  placeholder="Trusted by Industry Leaders" error={errors.main_heading} />
        </div>
      </div>
      <ModalActions onClose={onClose} onSubmit={handleSubmit} submitting={mutation.isPending} isEdit={true} />
    </Modal>
  );
};

// ─────────────────────────────────────────────
// TESTIMONIAL MODAL
// ─────────────────────────────────────────────
const TestimonialModal = ({ isOpen, onClose, data }) => {
  const queryClient = useQueryClient();
  const isEdit = !!data;

  const [form, setForm] = useState(() => ({
    rating:      data?.rating      || 0,
    author:      data?.author      || "",
    testimonial: data?.testimonial || "",
  }));
  const [errors, setErrors] = useState({});

  React.useEffect(() => {
    setForm({ rating: data?.rating || 0, author: data?.author || "", testimonial: data?.testimonial || "" });
    setErrors({});
  }, [data]);

  const mutation = useMutation({
    mutationFn: isEdit ? updateTestimonial : createTestimonial,
    onSuccess: () => { queryClient.invalidateQueries(["testimonials"]); toast.success(`Testimonial ${isEdit ? "updated" : "added"}!`); onClose(); },
    onError:   () => toast.error(`Failed to ${isEdit ? "update" : "add"} testimonial.`),
  });

  const validate = () => {
    const e = {};
    if (!form.rating || form.rating < 1)  e.rating      = "Please select a rating.";
    if (!form.author.trim())              e.author      = "Author name is required.";
    if (!form.testimonial.trim())         e.testimonial = "Testimonial text is required.";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    mutation.mutate(isEdit ? { id: data.id, ...form } : form);
  };

  const set = (key) => (ev) => {
    setForm(f => ({ ...f, [key]: ev.target.value }));
    setErrors(e => ({ ...e, [key]: "" }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Edit Testimonial" : "Add Testimonial"}>
      <div className="flex flex-col gap-4">
        <StarPicker
          value={form.rating}
          onChange={(v) => { setForm(f => ({ ...f, rating: v })); setErrors(e => ({ ...e, rating: "" })); }}
          error={errors.rating}
        />
        <Field label="Author" id="author" value={form.author} onChange={set("author")} placeholder="Jane Smith, CEO at Acme Corp" error={errors.author} />
        <TextareaField label="Testimonial" id="testimonial" value={form.testimonial} onChange={set("testimonial")} placeholder="Working with this team was exceptional..." rows={4} error={errors.testimonial} />
      </div>
      <ModalActions onClose={onClose} onSubmit={handleSubmit} submitting={mutation.isPending} isEdit={isEdit} />
    </Modal>
  );
};

// ─────────────────────────────────────────────
// MEMBER MODAL
// ─────────────────────────────────────────────
const MemberModal = ({ isOpen, onClose, data }) => {
  const queryClient = useQueryClient();
  const isEdit = !!data;
  const [name, setName]   = useState(data?.name || "");
  const [error, setError] = useState("");

  React.useEffect(() => { setName(data?.name || ""); setError(""); }, [data]);

  const mutation = useMutation({
    mutationFn: isEdit ? updateMember : createMember,
    onSuccess: () => { queryClient.invalidateQueries(["accredited-members"]); toast.success(`Member ${isEdit ? "updated" : "added"}!`); onClose(); },
    onError:   () => toast.error(`Failed to ${isEdit ? "update" : "add"} member.`),
  });

  const handleSubmit = () => {
    if (!name.trim()) { setError("Member name is required."); return; }
    setError("");
    mutation.mutate(isEdit ? { id: data.id, name } : { name });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Edit Member" : "Add Member"}>
      <Field
        label="Name" id="name" value={name}
        onChange={e => { setName(e.target.value); setError(""); }}
        placeholder="ISO 9001, CE Marking..."
        error={error}
      />
      <ModalActions onClose={onClose} onSubmit={handleSubmit} submitting={mutation.isPending} isEdit={isEdit} />
    </Modal>
  );
};

// ─────────────────────────────────────────────
// SHARED TABLE
// ─────────────────────────────────────────────
const SimpleTable = ({ columns, rows, onEdit, onDelete, deleteDisabled }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm text-left">
      <thead className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 uppercase text-xs">
        <tr>
          <th className="px-4 py-3 rounded-tl-md">#</th>
          {columns.map(c => <th key={c} className="px-4 py-3">{c}</th>)}
          <th className="px-4 py-3 rounded-tr-md text-center">Actions</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={row.id || i} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
            <td className="px-4 py-3 text-gray-500">{i + 1}</td>
            {row.cells.map((cell, ci) => <td key={ci} className="px-4 py-3 max-w-xs">{cell}</td>)}
            <td className="px-4 py-3">
              <div className="flex items-center justify-center gap-3">
                <button onClick={() => onEdit(row.raw)} className="text-blue-500 hover:text-blue-700 transition"><FiEdit size={16} /></button>
                <button onClick={() => onDelete(row.raw.id)} disabled={deleteDisabled} className="text-red-500 hover:text-red-700 transition disabled:opacity-40"><FiTrash size={16} /></button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────
const TestimonialsForm = () => {
  const queryClient = useQueryClient();

  const [sectionOpen,     setSectionOpen]     = useState(false);
  const [testimonialOpen, setTestimonialOpen] = useState(false);
  const [memberOpen,      setMemberOpen]      = useState(false);
  const [selTestimonial,  setSelTestimonial]  = useState(null);
  const [selMember,       setSelMember]       = useState(null);

  const { data: secResp,          isLoading: loadingSec  } = useQuery({ queryKey: ["testimonials-section"], queryFn: fetchSection });
  const { data: testimonials = [], isLoading: loadingTest } = useQuery({ queryKey: ["testimonials"],          queryFn: fetchTestimonials });
  const { data: members      = [], isLoading: loadingMem  } = useQuery({ queryKey: ["accredited-members"],    queryFn: fetchMembers });

  const sectionData = Array.isArray(secResp) ? secResp[0] || null : secResp || null;

  const delTestimonial = useMutation({
    mutationFn: deleteTestimonial,
    onSuccess: () => { queryClient.invalidateQueries(["testimonials"]);       toast.success("Testimonial deleted."); },
    onError:   () => toast.error("Failed to delete."),
  });
  const delMember = useMutation({
    mutationFn: deleteMember,
    onSuccess: () => { queryClient.invalidateQueries(["accredited-members"]); toast.success("Member deleted."); },
    onError:   () => toast.error("Failed to delete."),
  });

  const confirmDelete = (mutFn, id) => { if (confirm("Delete this item?")) mutFn(id); };

  return (
    <>
      {/* Modals */}
      <SectionModal
        key={`sec-${sectionData?.id ?? "init"}-${sectionOpen}`}
        isOpen={sectionOpen} onClose={() => setSectionOpen(false)} data={sectionData}
      />
      <TestimonialModal
        key={`test-${selTestimonial?.id ?? "new"}-${testimonialOpen}`}
        isOpen={testimonialOpen}
        onClose={() => { setTestimonialOpen(false); setSelTestimonial(null); }}
        data={selTestimonial}
      />
      <MemberModal
        key={`mem-${selMember?.id ?? "new"}-${memberOpen}`}
        isOpen={memberOpen}
        onClose={() => { setMemberOpen(false); setSelMember(null); }}
        data={selMember}
      />

      <div className="flex flex-col gap-8">

        {/* ── Section header ── */}
        <SectionCard title="Testimonials Section" onEdit={() => setSectionOpen(true)} loading={loadingSec}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <DisplayField label="Minor Heading" value={sectionData?.minor_heading} />
            <DisplayField label="Main Heading"  value={sectionData?.main_heading} />
          </div>
        </SectionCard>

        {/* ── Testimonials card grid ── */}
        <ListCard
          title="Testimonials"
          onAdd={() => { setSelTestimonial(null); setTestimonialOpen(true); }}
          loading={loadingTest}
          empty={testimonials.length === 0}
          emptyText="No testimonials added yet."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {testimonials.map(t => (
              <div
                key={t.id}
                className="group relative rounded-xl border border-gray-200 dark:border-strokedark shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-meta-4 p-5 flex flex-col gap-3"
              >
                {/* hover actions */}
                <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setSelTestimonial(t); setTestimonialOpen(true); }} className="bg-white dark:bg-boxdark text-blue-500 hover:text-blue-700 p-1.5 rounded-full shadow"><FiEdit size={13} /></button>
                  <button onClick={() => confirmDelete(delTestimonial.mutate, t.id)} disabled={delTestimonial.isPending} className="bg-white dark:bg-boxdark text-red-500 hover:text-red-700 p-1.5 rounded-full shadow disabled:opacity-40"><FiTrash size={13} /></button>
                </div>

                {/* rating */}
                <StarRating rating={t.rating} />

                {/* testimonial text */}
                <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-4 italic flex-1">
                  "{t.testimonial || "—"}"
                </p>

                {/* author */}
                <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                  — {t.author || "—"}
                </p>
              </div>
            ))}
          </div>
        </ListCard>

        {/* ── Accredited Members table ── */}
        <ListCard
          title="Accredited Members"
          onAdd={() => { setSelMember(null); setMemberOpen(true); }}
          loading={loadingMem}
          empty={members.length === 0}
          emptyText="No accredited members added yet."
        >
          <SimpleTable
            columns={["Name"]}
            rows={members.map(m => ({ id: m.id, raw: m, cells: [m.name] }))}
            onEdit={m => { setSelMember(m); setMemberOpen(true); }}
            onDelete={id => confirmDelete(delMember.mutate, id)}
            deleteDisabled={delMember.isPending}
          />
        </ListCard>

      </div>
    </>
  );
};

export default TestimonialsForm;
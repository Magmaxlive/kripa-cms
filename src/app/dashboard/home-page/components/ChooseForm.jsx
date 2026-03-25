"use client";
import React, { useState } from "react";
import axios from "axios";
import { baseURL } from "@/auth/auth";
import { FiEdit, FiTrash, FiPlus, FiX } from "react-icons/fi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import DynamicIcon from "./DynamicIcon";

// ─────────────────────────────────────────────
// API
// ─────────────────────────────────────────────

const fetchSection  = () => axios.get(`${baseURL}/whychoose/`).then(r => r.data);
const fetchPoints   = () => axios.get(`${baseURL}/whychoose-points/`).then(r => r.data);
const fetchCards    = () => axios.get(`${baseURL}/whychoose-cards/`).then(r => r.data);
const fetchCounters = () => axios.get(`${baseURL}/whychoose-counters/`).then(r => r.data);

const saveSection   = ({ id, ...data }) => id ? axios.patch(`${baseURL}/whychoose/${id}/`, data ) : axios.post(`${baseURL}/whychoose/`, data );
const createPoint   = (data) => axios.post(`${baseURL}/whychoose-points/`, data );
const updatePoint   = ({ id, ...data }) => axios.patch(`${baseURL}/whychoose-points/${id}/`, data);
const deletePoint   = (id) => axios.delete(`${baseURL}/whychoose-points/${id}/`);
const createCard    = (data) => axios.post(`${baseURL}/whychoose-cards/`, data);
const updateCard    = ({ id, ...data }) => axios.patch(`${baseURL}/whychoose-cards/${id}/`, data);
const deleteCard    = (id) => axios.delete(`${baseURL}/whychoose-cards/${id}/`);
const createCounter = (data) => axios.post(`${baseURL}/whychoose-counters/`, data);
const updateCounter = ({ id, ...data }) => axios.patch(`${baseURL}/whychoose-counters/${id}/`, data);
const deleteCounter = (id) => axios.delete(`${baseURL}/whychoose-counters/${id}/`);

// ─────────────────────────────────────────────
// SHARED UI PRIMITIVES
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

// Field with optional inline error
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

// Textarea with optional inline error
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
  <div className="flex flex-col gap-2 w-full">
    <label className="text-sm font-medium">{label}</label>
    <p className="border min-h-12 w-full rounded-md p-3 border-gray-300 text-sm text-gray-700 dark:text-gray-300 dark:border-strokedark">{value || "—"}</p>
  </div>
);

const SectionCard = ({ title, onEdit, loading, children }) => (
  <div className="bg-white dark:bg-boxdark rounded-lg shadow-sm p-6 border border-stroke dark:border-strokedark">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      <button onClick={onEdit} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90 transition"><FiEdit size={14} /> Edit</button>
    </div>
    {loading ? <p className="text-gray-400 text-sm">Loading...</p> : children}
  </div>
);

const ListCard = ({ title, onAdd, loading, empty, children }) => (
  <div className="bg-white dark:bg-boxdark rounded-lg shadow-sm p-6 border border-stroke dark:border-strokedark">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-semibold">{title}</h2>
      <button onClick={onAdd} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90 transition"><FiPlus size={14} /> Add</button>
    </div>
    {loading ? <p className="text-gray-400 text-sm">Loading...</p> : empty ? <p className="text-gray-400 text-sm">Nothing added yet.</p> : children}
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
    paragraph:     data?.paragraph     || "",
    button_text:   data?.button_text   || "",
    button_icon:   data?.button_icon   || "",
    button_link:   data?.button_link   || "",
  }));
  const [errors, setErrors] = useState({});

  React.useEffect(() => {
    setForm({
      minor_heading: data?.minor_heading || "",
      main_heading:  data?.main_heading  || "",
      paragraph:     data?.paragraph     || "",
      button_text:   data?.button_text   || "",
      button_icon:   data?.button_icon   || "",
      button_link:   data?.button_link   || "",
    });
    setErrors({});
  }, [data]);

  const mutation = useMutation({
    mutationFn: saveSection,
    onSuccess: () => { queryClient.invalidateQueries(["whychoose-section"]); toast.success("Section updated!"); onClose(); },
    onError:   () => toast.error("Failed to update section."),
  });

  const validate = () => {
    const e = {};
    if (!form.minor_heading.trim()) e.minor_heading = "Minor heading is required.";
    if (!form.main_heading.trim())  e.main_heading  = "Main heading is required.";
    if (!form.paragraph.trim())     e.paragraph     = "Paragraph is required.";
    if (!form.button_icon.trim()) e.button_icon = "Button Icon is required.";
    if (!form.button_link.trim())  e.button_link  = "Button Link is required.";
    if (!form.button_text.trim())     e.button_text     = "Button Text is required.";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    mutation.mutate({ id: data?.id, ...form });
  };

  const set = (key) => (ev) => { setForm(f => ({ ...f, [key]: ev.target.value })); setErrors(e => ({ ...e, [key]: "" })); };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Why Choose Us Section">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Minor Heading" id="minor_heading" value={form.minor_heading} onChange={set("minor_heading")} placeholder="Why Choose Us"       error={errors.minor_heading} />
          <Field label="Main Heading"  id="main_heading"  value={form.main_heading}  onChange={set("main_heading")}  placeholder="Built for Performance" error={errors.main_heading} />
        </div>
        <TextareaField label="Paragraph" id="paragraph" value={form.paragraph} onChange={set("paragraph")} rows={4} error={errors.paragraph} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Button Text" id="button_text" value={form.button_text} onChange={set("button_text")} placeholder="Book a Call"  error={errors.button_text} />
          <Field label="Button Icon" id="button_icon" value={form.button_icon} onChange={set("button_icon")} placeholder="MoveRight"    error={errors.button_icon} />
          <Field label="Button Link" id="button_link" value={form.button_link} onChange={set("button_link")} placeholder="/contact-us"  error={errors.button_link} />
        </div>
      </div>
      <ModalActions onClose={onClose} onSubmit={handleSubmit} submitting={mutation.isPending} isEdit={true} />
    </Modal>
  );
};

// ─────────────────────────────────────────────
// POINT MODAL
// ─────────────────────────────────────────────
const PointModal = ({ isOpen, onClose, data }) => {
  const queryClient = useQueryClient();
  const isEdit = !!data;
  const [content, setContent] = useState(data?.content || "");
  const [error, setError] = useState("");

  React.useEffect(() => { setContent(data?.content || ""); setError(""); }, [data]);

  const mutation = useMutation({
    mutationFn: isEdit ? updatePoint : createPoint,
    onSuccess: () => { queryClient.invalidateQueries(["whychoose-points"]); toast.success(`Point ${isEdit ? "updated" : "added"}!`); onClose(); },
    onError:   () => toast.error("Failed to save point."),
  });

  const handleSubmit = () => {
    if (!content.trim()) { setError("Content is required."); return; }
    setError("");
    mutation.mutate(isEdit ? { id: data.id, content } : { content });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Edit Point" : "Add Point"}>
      <Field
        label="Content" id="content" value={content}
        onChange={e => { setContent(e.target.value); setError(""); }}
        placeholder="We deliver on time, every time."
        error={error}
      />
      <ModalActions onClose={onClose} onSubmit={handleSubmit} submitting={mutation.isPending} isEdit={isEdit} />
    </Modal>
  );
};

// ─────────────────────────────────────────────
// CARD MODAL
// ─────────────────────────────────────────────
const CardModal = ({ isOpen, onClose, data }) => {
  const queryClient = useQueryClient();
  const isEdit = !!data;
  const [form, setForm]   = useState(() => ({ icon: data?.icon || "", title: data?.title || "", description: data?.description || "" }));
  const [errors, setErrors] = useState({});

  React.useEffect(() => {
    setForm({ icon: data?.icon || "", title: data?.title || "", description: data?.description || "" });
    setErrors({});
  }, [data]);

  const mutation = useMutation({
    mutationFn: isEdit ? updateCard : createCard,
    onSuccess: () => { queryClient.invalidateQueries(["whychoose-cards"]); toast.success(`Card ${isEdit ? "updated" : "added"}!`); onClose(); },
    onError:   () => toast.error("Failed to save card."),
  });

  const validate = () => {
    const e = {};
    if (!form.title.trim())       e.title       = "Title is required.";
    if (!form.description.trim()) e.description = "Description is required.";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    mutation.mutate(isEdit ? { id: data.id, ...form } : form);
  };

  const set = (key) => (ev) => { setForm(f => ({ ...f, [key]: ev.target.value })); setErrors(e => ({ ...e, [key]: "" })); };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Edit Card" : "Add Card"}>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Icon"  id="icon"  value={form.icon}  onChange={set("icon")}  placeholder="ShieldCheck" error={errors.icon} />
          <Field label="Title" id="title" value={form.title} onChange={set("title")} placeholder="Reliability"  error={errors.title} />
        </div>
        <TextareaField label="Description" id="description" value={form.description} onChange={set("description")} placeholder="We stand behind every product we ship." rows={3} error={errors.description} />
      </div>
      <ModalActions onClose={onClose} onSubmit={handleSubmit} submitting={mutation.isPending} isEdit={isEdit} />
    </Modal>
  );
};

// ─────────────────────────────────────────────
// COUNTER MODAL
// ─────────────────────────────────────────────
const CounterModal = ({ isOpen, onClose, data }) => {
  const queryClient = useQueryClient();
  const isEdit = !!data;
  const [form, setForm]   = useState(() => ({ title: data?.title || "", description: data?.description || "" }));
  const [errors, setErrors] = useState({});

  React.useEffect(() => {
    setForm({ title: data?.title || "", description: data?.description || "" });
    setErrors({});
  }, [data]);

  const mutation = useMutation({
    mutationFn: isEdit ? updateCounter : createCounter,
    onSuccess: () => { queryClient.invalidateQueries(["whychoose-counters"]); toast.success(`Counter ${isEdit ? "updated" : "added"}!`); onClose(); },
    onError:   () => toast.error("Failed to save counter."),
  });

  const validate = () => {
    const e = {};
    if (!form.title.trim())       e.title       = "Title is required.";
    if (!form.description.trim()) e.description = "Description is required.";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    mutation.mutate(isEdit ? { id: data.id, ...form } : form);
  };

  const set = (key) => (ev) => { setForm(f => ({ ...f, [key]: ev.target.value })); setErrors(e => ({ ...e, [key]: "" })); };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Edit Counter" : "Add Counter"}>
      <div className="flex flex-col gap-4">
        <Field label="Title (number / stat)" id="title"       value={form.title}       onChange={set("title")}       placeholder="500+"              error={errors.title} />
        <Field label="Description"           id="description" value={form.description} onChange={set("description")} placeholder="Projects Delivered" error={errors.description} />
      </div>
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
            {row.cells.map((cell, ci) => <td key={ci} className="px-4 py-3 max-w-xs truncate">{cell || "—"}</td>)}
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
const WhyChooseForm = () => {
  const queryClient = useQueryClient();

  const [sectionOpen, setSectionOpen] = useState(false);
  const [pointOpen,   setPointOpen]   = useState(false);
  const [cardOpen,    setCardOpen]    = useState(false);
  const [counterOpen, setCounterOpen] = useState(false);
  const [selPoint,    setSelPoint]    = useState(null);
  const [selCard,     setSelCard]     = useState(null);
  const [selCounter,  setSelCounter]  = useState(null);

  const { data: secResp,      isLoading: loadingSec   } = useQuery({ queryKey: ["whychoose-section"],  queryFn: fetchSection });
  const { data: points   = [], isLoading: loadingPts   } = useQuery({ queryKey: ["whychoose-points"],   queryFn: fetchPoints });
  const { data: cards    = [], isLoading: loadingCards  } = useQuery({ queryKey: ["whychoose-cards"],    queryFn: fetchCards });
  const { data: counters = [], isLoading: loadingCtrs   } = useQuery({ queryKey: ["whychoose-counters"], queryFn: fetchCounters });

  const sectionData = Array.isArray(secResp) ? secResp[0] || null : secResp || null;

  const delPoint   = useMutation({ mutationFn: deletePoint,   onSuccess: () => { queryClient.invalidateQueries(["whychoose-points"]);   toast.success("Point deleted.");   }, onError: () => toast.error("Failed.") });
  const delCard    = useMutation({ mutationFn: deleteCard,    onSuccess: () => { queryClient.invalidateQueries(["whychoose-cards"]);    toast.success("Card deleted.");    }, onError: () => toast.error("Failed.") });
  const delCounter = useMutation({ mutationFn: deleteCounter, onSuccess: () => { queryClient.invalidateQueries(["whychoose-counters"]); toast.success("Counter deleted."); }, onError: () => toast.error("Failed.") });

  const confirmDelete = (mutFn, id) => { if (confirm("Delete this item?")) mutFn(id); };

  return (
    <>
      <SectionModal isOpen={sectionOpen} onClose={() => setSectionOpen(false)} data={sectionData} />
      <PointModal   key={`pt-${selPoint?.id   ?? "new"}-${pointOpen}`}   isOpen={pointOpen}   onClose={() => { setPointOpen(false);   setSelPoint(null);   }} data={selPoint} />
      <CardModal    key={`cd-${selCard?.id    ?? "new"}-${cardOpen}`}    isOpen={cardOpen}    onClose={() => { setCardOpen(false);    setSelCard(null);    }} data={selCard} />
      <CounterModal key={`ct-${selCounter?.id ?? "new"}-${counterOpen}`} isOpen={counterOpen} onClose={() => { setCounterOpen(false); setSelCounter(null); }} data={selCounter} />

      <div className="flex flex-col gap-8">

        {/* Section header */}
        <SectionCard title="Why Choose Us — Section" onEdit={() => setSectionOpen(true)} loading={loadingSec}>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <DisplayField label="Minor Heading" value={sectionData?.minor_heading} />
              <DisplayField label="Main Heading"  value={sectionData?.main_heading} />
            </div>
            <DisplayField label="Paragraph" value={sectionData?.paragraph} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <DisplayField label="Button Text" value={sectionData?.button_text} />
              <DisplayField label="Button Icon" value={sectionData?.button_icon} />
              <DisplayField label="Button Link" value={sectionData?.button_link} />
            </div>
          </div>
        </SectionCard>

        {/* Points table */}
        <ListCard title="Points" onAdd={() => { setSelPoint(null); setPointOpen(true); }} loading={loadingPts} empty={points.length === 0}>
          <SimpleTable
            columns={["Content"]}
            rows={points.map(p => ({ id: p.id, raw: p, cells: [p.content] }))}
            onEdit={p => { setSelPoint(p); setPointOpen(true); }}
            onDelete={id => confirmDelete(delPoint.mutate, id)}
            deleteDisabled={delPoint.isPending}
          />
        </ListCard>

        {/* Cards grid */}
        <ListCard title="Cards" onAdd={() => { setSelCard(null); setCardOpen(true); }} loading={loadingCards} empty={cards.length === 0}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {cards.map(card => (
              <div key={card.id} className="group relative rounded-xl border border-gray-200 dark:border-strokedark shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-meta-4 p-5 flex flex-col gap-2">
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setSelCard(card); setCardOpen(true); }} className="bg-white dark:bg-boxdark text-blue-500 hover:text-blue-700 p-1.5 rounded-full shadow"><FiEdit size={13} /></button>
                  <button onClick={() => confirmDelete(delCard.mutate, card.id)} disabled={delCard.isPending} className="bg-white dark:bg-boxdark text-red-500 hover:text-red-700 p-1.5 rounded-full shadow"><FiTrash size={13} /></button>
                </div>
                {card.icon && (
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary mb-1">
                    <DynamicIcon name={card.icon} />
                  </span>
                )}
                <h3 className="font-semibold text-sm text-gray-800 dark:text-white capitalize">{card.title || "—"}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3">{card.description || "—"}</p>
              </div>
            ))}
          </div>
        </ListCard>

        {/* Counters grid */}
        <ListCard title="Counters" onAdd={() => { setSelCounter(null); setCounterOpen(true); }} loading={loadingCtrs} empty={counters.length === 0}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {counters.map(counter => (
              <div key={counter.id} className="group relative rounded-xl border border-gray-200 dark:border-strokedark shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-meta-4 p-5 text-center flex flex-col gap-1">
                <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setSelCounter(counter); setCounterOpen(true); }} className="bg-white dark:bg-boxdark text-blue-500 hover:text-blue-700 p-1 rounded-full shadow"><FiEdit size={12} /></button>
                  <button onClick={() => confirmDelete(delCounter.mutate, counter.id)} disabled={delCounter.isPending} className="bg-white dark:bg-boxdark text-red-500 hover:text-red-700 p-1 rounded-full shadow"><FiTrash size={12} /></button>
                </div>
                <p className="text-2xl font-bold text-primary">{counter.title || "—"}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{counter.description || "—"}</p>
              </div>
            ))}
          </div>
        </ListCard>

      </div>
    </>
  );
};

export default WhyChooseForm;
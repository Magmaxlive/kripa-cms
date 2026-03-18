"use client";
import React, { useState } from "react";
import axios from "axios";
import { baseURL, authToken } from "@/auth/auth";
import { FiEdit, FiTrash, FiPlus, FiX } from "react-icons/fi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

// ─────────────────────────────────────────────
// API
// ─────────────────────────────────────────────
const authHeaders = { Authorization: `Bearer ${authToken}` };

const fetchSection = () => axios.get(`${baseURL}/insights-section/`).then(r => r.data);
const saveSection  = ({ id, ...data }) =>
  id
    ? axios.patch(`${baseURL}/insights-section/${id}/`, data, { headers: authHeaders })
    : axios.post(`${baseURL}/insights-section/`, data,        { headers: authHeaders });

const fetchVideos   = () => axios.get(`${baseURL}/insights-videos/`).then(r => r.data);
const createVideo   = (data) => axios.post(`${baseURL}/insights-videos/`, data,         { headers: authHeaders });
const updateVideo   = ({ id, ...data }) => axios.patch(`${baseURL}/insights-videos/${id}/`, data, { headers: authHeaders });
const deleteVideo   = (id) => axios.delete(`${baseURL}/insights-videos/${id}/`,              { headers: authHeaders });

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

const ListCard = ({ title, onAdd, loading, empty, children }) => (
  <div className="bg-white dark:bg-boxdark rounded-lg shadow-sm p-6 border border-stroke dark:border-strokedark">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-semibold">{title}</h2>
      <button onClick={onAdd} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90 transition">
        <FiPlus size={14} /> Add
      </button>
    </div>
    {loading ? <p className="text-gray-400 text-sm">Loading...</p>
      : empty  ? <p className="text-gray-400 text-sm">No videos added yet.</p>
      : children}
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
    mutationFn: saveSection,
    onSuccess: () => { queryClient.invalidateQueries(["insights-section"]); toast.success("Section updated!"); onClose(); },
    onError:   () => toast.error("Failed to update section."),
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
    setForm(f => ({ ...f, [key]: ev.target.value }));
    setErrors(e => ({ ...e, [key]: "" }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Insights Section">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Minor Heading" id="minor_heading" value={form.minor_heading} onChange={set("minor_heading")} placeholder="Latest Insights" error={errors.minor_heading} />
          <Field label="Main Heading"  id="main_heading"  value={form.main_heading}  onChange={set("main_heading")}  placeholder="Stay Ahead of the Curve" error={errors.main_heading} />
        </div>
        <TextareaField label="Paragraph" id="paragraph" value={form.paragraph} onChange={set("paragraph")} placeholder="Describe the insights section..." rows={4} error={errors.paragraph} />
      </div>
      <ModalActions onClose={onClose} onSubmit={handleSubmit} submitting={mutation.isPending} isEdit={true} />
    </Modal>
  );
};

// ─────────────────────────────────────────────
// VIDEO MODAL
// ─────────────────────────────────────────────
const VideoModal = ({ isOpen, onClose, data }) => {
  const queryClient = useQueryClient();
  const isEdit = !!data;

  const [form, setForm] = useState(() => ({
    video_link:  data?.video_link  || "",
    title:       data?.title       || "",
    description: data?.description || "",
    button_text: data?.button_text || "",
    button_link: data?.button_link || "",
    button_icon: data?.button_icon || "",
  }));
  const [errors, setErrors] = useState({});

  React.useEffect(() => {
    setForm({
      video_link:  data?.video_link  || "",
      title:       data?.title       || "",
      description: data?.description || "",
      button_text: data?.button_text || "",
      button_link: data?.button_link || "",
      button_icon: data?.button_icon || "",
    });
    setErrors({});
  }, [data]);

  const mutation = useMutation({
    mutationFn: isEdit ? updateVideo : createVideo,
    onSuccess: () => { queryClient.invalidateQueries(["insights-videos"]); toast.success(`Video ${isEdit ? "updated" : "added"}!`); onClose(); },
    onError:   () => toast.error(`Failed to ${isEdit ? "update" : "add"} video.`),
  });

  const validate = () => {
    const e = {};
    if (!form.video_link.trim()) {
      e.video_link = "Video link is required.";
    } else {
      try { new URL(form.video_link.trim()); }
      catch { e.video_link = "Please enter a valid URL (e.g. https://...)."; }
    }
    if (!form.title.trim())       e.title       = "Title is required.";
    if (!form.description.trim()) e.description = "Description is required.";
    if (!form.button_text.trim())       e.button_text       = "Button Text is required.";
    if (!form.button_link.trim()) e.button_link = "Button Link is required.";
    if (!form.button_icon.trim()) e.button_icon = "Button Icon is required.";

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
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Edit Video" : "Add Video"}>
      <div className="flex flex-col gap-4">

        <Field label="Video Link" id="video_link" value={form.video_link} onChange={set("video_link")} placeholder="https://youtube.com/watch?v=..." error={errors.video_link} />
        <Field label="Title"      id="title"      value={form.title}      onChange={set("title")}      placeholder="How We Engineer Excellence"  error={errors.title} />
        <TextareaField label="Description" id="description" value={form.description} onChange={set("description")} placeholder="Brief description of the video..." rows={3} error={errors.description} />

        <hr className="border-gray-200 dark:border-strokedark" />
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Button</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Button Text" id="button_text" value={form.button_text} onChange={set("button_text")} placeholder="Watch Now"   error={errors.button_text} />
          <Field label="Button Icon" id="button_icon" value={form.button_icon} onChange={set("button_icon")} placeholder="Play"        error={errors.button_icon} />
          <Field label="Button Link" id="button_link" value={form.button_link} onChange={set("button_link")} placeholder="/insights/1" error={errors.button_link} />
        </div>

      </div>
      <ModalActions onClose={onClose} onSubmit={handleSubmit} submitting={mutation.isPending} isEdit={isEdit} />
    </Modal>
  );
};

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────
const InsightsForm = () => {
  const queryClient = useQueryClient();

  const [sectionOpen, setSectionOpen] = useState(false);
  const [videoOpen,   setVideoOpen]   = useState(false);
  const [selVideo,    setSelVideo]    = useState(null);

  const { data: secResp,     isLoading: loadingSec    } = useQuery({ queryKey: ["insights-section"], queryFn: fetchSection });
  const { data: videos = [], isLoading: loadingVideos } = useQuery({ queryKey: ["insights-videos"],  queryFn: fetchVideos  });

  const sectionData = Array.isArray(secResp) ? secResp[0] || null : secResp || null;

  const delVideo = useMutation({
    mutationFn: deleteVideo,
    onSuccess: () => { queryClient.invalidateQueries(["insights-videos"]); toast.success("Video deleted."); },
    onError:   () => toast.error("Failed to delete video."),
  });

  const handleEdit   = (v) => { setSelVideo(v); setVideoOpen(true); };
  const handleAdd    = ()  => { setSelVideo(null); setVideoOpen(true); };
  const handleClose  = ()  => { setVideoOpen(false); setSelVideo(null); };
  const handleDelete = (id) => { if (confirm("Delete this video?")) delVideo.mutate(id); };

  return (
    <>
      <SectionModal
        key={`sec-${sectionData?.id ?? "init"}-${sectionOpen}`}
        isOpen={sectionOpen} onClose={() => setSectionOpen(false)} data={sectionData}
      />
      <VideoModal
        key={`vid-${selVideo?.id ?? "new"}-${videoOpen}`}
        isOpen={videoOpen} onClose={handleClose} data={selVideo}
      />

      <div className="flex flex-col gap-8">

        {/* ── Section header ── */}
        <SectionCard title="Insights Section" onEdit={() => setSectionOpen(true)} loading={loadingSec}>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <DisplayField label="Minor Heading" value={sectionData?.minor_heading} />
              <DisplayField label="Main Heading"  value={sectionData?.main_heading} />
            </div>
            <DisplayField label="Paragraph" value={sectionData?.paragraph} />
          </div>
        </SectionCard>

        {/* ── Videos card grid ── */}
        <ListCard title="Insight Videos" onAdd={handleAdd} loading={loadingVideos} empty={videos.length === 0}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {videos.map((video) => (
              <div
                key={video.id}
                className="group relative rounded-xl border border-gray-200 dark:border-strokedark shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-meta-4 overflow-hidden flex flex-col"
              >
                {/* Video thumbnail from YouTube/Vimeo */}
                <div className="relative h-40 w-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                  {video.video_link?.includes("youtube.com") || video.video_link?.includes("youtu.be") ? (
                    <img
                      src={`https://img.youtube.com/vi/${extractYoutubeId(video.video_link)}/hqdefault.jpg`}
                      alt={video.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-4.586-2.837A1 1 0 009 9.168v5.664a1 1 0 001.166.987l4.586-1.33A1 1 0 0016 13.5v-1.664a1 1 0 00-.748-.968l-.5-.14z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs">Video</span>
                    </div>
                  )}

                  {/* hover actions */}
                  <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(video)} className="bg-white dark:bg-boxdark text-blue-500 hover:text-blue-700 p-1.5 rounded-full shadow"><FiEdit size={13} /></button>
                    <button onClick={() => handleDelete(video.id)} disabled={delVideo.isPending} className="bg-white dark:bg-boxdark text-red-500 hover:text-red-700 p-1.5 rounded-full shadow disabled:opacity-40"><FiTrash size={13} /></button>
                  </div>
                </div>

                {/* card body */}
                <div className="p-4 flex flex-col gap-1 flex-1">
                  <h3 className="font-semibold text-sm text-gray-800 dark:text-white line-clamp-1">{video.title || "—"}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{video.description || "—"}</p>
                  {video.button_text && (
                    <span className="mt-auto pt-2 text-xs text-primary font-medium">{video.button_text}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ListCard>

      </div>
    </>
  );
};

// ─────────────────────────────────────────────
// HELPER — extract YouTube video ID
// ─────────────────────────────────────────────
function extractYoutubeId(url = "") {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
    return u.searchParams.get("v") || "";
  } catch {
    return "";
  }
}

export default InsightsForm;
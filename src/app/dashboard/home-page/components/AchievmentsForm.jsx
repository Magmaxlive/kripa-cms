"use client";
import React, { useState } from "react";
import axios from "axios";
import { baseURL } from "@/auth/auth";
import { FiEdit, FiTrash, FiPlus, FiX } from "react-icons/fi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

// ─────────────────────────────────────────────
// API
// ─────────────────────────────────────────────
const MAX_SIZE = 1 * 1024 * 1024; // 1 MB

const fetchAchievements = () => axios.get(`${baseURL}/achievements/`).then(r => r.data);

const createAchievement = (formData) =>
  axios.post(`${baseURL}/achievements/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

const updateAchievement = (formData) => {
  const id = formData.get("id");
  formData.delete("id");
  return axios.patch(`${baseURL}/achievements/${id}/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

const deleteAchievement = (id) =>
  axios.delete(`${baseURL}/achievements/${id}/`);

// ─────────────────────────────────────────────
// SHARED UI
// ─────────────────────────────────────────────
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" style={{ zIndex: 9999 }}>
      <div className="bg-white dark:bg-boxdark rounded-lg shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" style={{ zIndex: 10000 }}>
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

const ModalActions = ({ onClose, onSubmit, submitting, isEdit }) => (
  <div className="flex justify-end gap-3 mt-6">
    <button onClick={onClose} className="px-4 py-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 transition">Cancel</button>
    <button onClick={onSubmit} disabled={submitting} className="px-4 py-2 rounded bg-primary text-white hover:bg-opacity-90 transition disabled:opacity-60">
      {submitting ? "Saving..." : isEdit ? "Update" : "Save"}
    </button>
  </div>
);

// ─────────────────────────────────────────────
// ACHIEVEMENT MODAL
// ─────────────────────────────────────────────
const AchievementModal = ({ isOpen, onClose, data }) => {
  const queryClient = useQueryClient();
  const isEdit = !!data;

  const [alt, setAlt]           = useState(data?.alt || "");
  const [file, setFile]         = useState(null);
  const [preview, setPreview]   = useState(data?.image || "");
  const [errors, setErrors]     = useState({});
  const fileRef                 = React.useRef(null);

  React.useEffect(() => {
    setAlt(data?.alt || "");
    setFile(null);
    setPreview(data?.image || "");
    setErrors({});
  }, [data]);

  // revoke object URL on cleanup
  React.useEffect(() => {
    return () => { if (file) URL.revokeObjectURL(preview); };
  }, [preview]);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setErrors(ev => ({ ...ev, image: "Only image files are allowed." }));
      e.target.value = "";
      return;
    }
    if (f.size > MAX_SIZE) {
      setErrors(ev => ({ ...ev, image: "Image must be 1 MB or smaller." }));
      e.target.value = "";
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setErrors(ev => ({ ...ev, image: "" }));
  };

  const handleRemoveImage = () => {
    setFile(null);
    setPreview("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const mutation = useMutation({
    mutationFn: isEdit ? updateAchievement : createAchievement,
    onSuccess: () => {
      queryClient.invalidateQueries(["achievements"]);
      toast.success(`Achievement ${isEdit ? "updated" : "added"} successfully!`);
      onClose();
    },
    onError: () => toast.error(`Failed to ${isEdit ? "update" : "add"} achievement.`),
  });

  const validate = () => {
    const e = {};
    if (!alt.trim())            e.alt   = "Alt text is required.";
    if (!isEdit && !file)       e.image = "Image is required.";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});

    const fd = new FormData();
    if (isEdit) fd.append("id", data.id);
    fd.append("alt", alt.trim());
    if (file) fd.append("image", file);
    mutation.mutate(fd);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Edit Achievement" : "Add Achievement"}>
      <div className="flex flex-col gap-4">

        {/* Alt text */}
        <Field
          label="Alt Text" id="alt" value={alt}
          onChange={e => { setAlt(e.target.value); setErrors(ev => ({ ...ev, alt: "" })); }}
          placeholder="Award for best product 2024"
          error={errors.alt}
        />

        {/* Image upload */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">
            Image
            {!isEdit && <span className="text-red-500 ml-1">*</span>}
            <span className="text-gray-400 font-normal ml-1">(max 1 MB)</span>
          </label>

          {preview && (
            <div className="relative w-full h-40 border rounded-lg overflow-hidden bg-gray-50 dark:bg-meta-4 flex items-center justify-center">
              <img src={preview} alt="preview" className="max-h-full max-w-full object-contain" />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-white rounded-full shadow p-1 text-red-500 hover:text-red-700"
              >
                <FiX size={14} />
              </button>
            </div>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className={`text-sm file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-opacity-90 cursor-pointer
              ${errors.image ? "border border-red-400 rounded-md p-1" : ""}`}
          />
          {errors.image && <p className="text-xs text-red-500">{errors.image}</p>}
        </div>

      </div>
      <ModalActions onClose={onClose} onSubmit={handleSubmit} submitting={mutation.isPending} isEdit={isEdit} />
    </Modal>
  );
};

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────
const AchievementsForm = () => {
  const queryClient = useQueryClient();
  const [modalOpen,  setModalOpen]  = useState(false);
  const [selected,   setSelected]   = useState(null);

  const { data: achievements = [], isLoading } = useQuery({
    queryKey: ["achievements"],
    queryFn: fetchAchievements,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAchievement,
    onSuccess: () => { queryClient.invalidateQueries(["achievements"]); toast.success("Achievement deleted."); },
    onError:   () => toast.error("Failed to delete achievement."),
  });

  const handleEdit   = (item) => { setSelected(item); setModalOpen(true); };
  const handleAdd    = ()     => { setSelected(null); setModalOpen(true); };
  const handleClose  = ()     => { setModalOpen(false); setSelected(null); };
  const handleDelete = (id)   => { if (confirm("Delete this achievement?")) deleteMutation.mutate(id); };

  return (
    <>
      <AchievementModal
        key={`ach-${selected?.id ?? "new"}-${modalOpen}`}
        isOpen={modalOpen}
        onClose={handleClose}
        data={selected}
      />

      <div className="bg-white dark:bg-boxdark rounded-lg shadow-sm p-6 border border-stroke dark:border-strokedark">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Achievements</h2>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90 transition"
          >
            <FiPlus size={14} /> Add
          </button>
        </div>

        {isLoading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : achievements.length === 0 ? (
          <p className="text-gray-400 text-sm">No achievements added yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {achievements.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-xl border border-gray-200 dark:border-strokedark shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-meta-4 overflow-hidden"
              >
                {/* image */}
                <div className="h-32 w-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center p-3">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.alt}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-gray-300 text-xs">No image</span>
                  )}
                </div>

                {/* alt text */}
                <div className="px-3 py-2">
                  <p className="text-xs text-gray-600 dark:text-gray-400 text-center truncate capitalize" title={item.alt}>
                    {item.alt || "—"}
                  </p>
                </div>

                {/* hover actions */}
                <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(item)}
                    className="bg-white dark:bg-boxdark text-blue-500 hover:text-blue-700 p-1.5 rounded-full shadow"
                    title="Edit"
                  >
                    <FiEdit size={12} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deleteMutation.isPending}
                    className="bg-white dark:bg-boxdark text-red-500 hover:text-red-700 p-1.5 rounded-full shadow disabled:opacity-40"
                    title="Delete"
                  >
                    <FiTrash size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default AchievementsForm;
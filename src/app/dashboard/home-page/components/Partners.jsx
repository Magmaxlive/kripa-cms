"use client";
import React, { useState } from "react";
import axios from "axios";
import { baseURL } from "@/auth/auth";
import Loader from "@/components/Loader/loader";
import { FiEdit, FiTrash, FiPlus, FiX } from "react-icons/fi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

// ---------- API FUNCTIONS ----------
const fetchPartners = () =>
  axios.get(`${baseURL}/partners/`).then((res) => res.data);

const createPartner = (data) =>
  axios.post(`${baseURL}/partners/`, data, {
    headers: {  "Content-Type": "multipart/form-data" },
  });

const updatePartner = (formData) => {
  const id = formData.get("id");
  formData.delete("id");
  return axios.patch(`${baseURL}/partners/${id}/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

const deletePartner = (id) =>
  axios.delete(`${baseURL}/partners/${id}/`);

// ---------- MODAL WRAPPER ----------
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-boxdark rounded-lg shadow-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// ---------- REUSABLE FIELD ----------
const Field = ({ label, id, value, onChange, placeholder }) => (
  <div className="flex flex-col gap-2">
    <label htmlFor={id} className="text-sm font-medium">
      {label}
    </label>
    <input
      id={id}
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder || `Enter ${label}`}
      className="border h-11 w-full rounded-md px-3 border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
    />
  </div>
);

// ---------- REUSABLE MODAL ACTIONS ----------
const ModalActions = ({ onClose, onSubmit, submitting, isEdit }) => (
  <div className="flex justify-end gap-3 mt-6">
    <button
      onClick={onClose}
      className="px-4 py-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
    >
      Cancel
    </button>
    <button
      onClick={onSubmit}
      disabled={submitting}
      className="px-4 py-2 rounded bg-primary text-white hover:bg-opacity-90 transition disabled:opacity-60"
    >
      {submitting ? "Saving..." : isEdit ? "Update" : "Save"}
    </button>
  </div>
);

// ---------- PARTNER MODAL (create & edit) ----------
const MAX_LOGO_SIZE = 1 * 1024 * 1024; // 1 MB

const PartnerModal = ({ isOpen, onClose, data }) => {
  const queryClient = useQueryClient();
  const isEdit = !!data;

  const [name, setName] = useState("");
  const [logoFile, setLogoFile] = useState(null);       // new file chosen by user
  const [previewUrl, setPreviewUrl] = useState("");     // preview src (object URL or existing URL)
  const fileInputRef = React.useRef(null);

  // Reset form whenever modal opens with new data
  React.useEffect(() => {
    setName(data?.name || "");
    setLogoFile(null);
    setPreviewUrl(data?.logo || "");
  }, [data]);

  // Revoke object URL on unmount / file change to avoid memory leaks
  React.useEffect(() => {
    return () => {
      if (logoFile) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed.");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_LOGO_SIZE) {
      toast.error("Logo must be 1 MB or smaller.");
      e.target.value = "";
      return;
    }

    setLogoFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setPreviewUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const mutation = useMutation({
    mutationFn: isEdit ? updatePartner : createPartner,
    onSuccess: () => {
      queryClient.invalidateQueries(["partners"]);
      toast.success(`Partner ${isEdit ? "updated" : "created"} successfully!`);
      onClose();
    },
    onError: () => {
      toast.error(`Failed to ${isEdit ? "update" : "create"} partner`);
    },
  });

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Vendor name is required.");
      return;
    }
    if (!isEdit && !logoFile) {
      toast.error("Please upload a logo.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name.trim());
    if (logoFile) formData.append("logo", logoFile);

    if (isEdit) formData.append("id", data.id);
    mutation.mutate(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Edit Partner" : "Add Partner"}>
      <div className="flex flex-col gap-5">
        {/* Vendor Name */}
        <Field
          label="Vendor Name"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* Logo Upload */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">
            Logo <span className="text-gray-400 font-normal">(image, max 1 MB)</span>
          </label>

          {/* Preview */}
          {previewUrl && (
            <div className="relative w-24 h-24 border rounded-md overflow-hidden bg-gray-50 flex items-center justify-center">
              <img
                src={previewUrl}
                alt="Logo preview"
                className="max-h-full max-w-full object-contain"
              />
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="absolute top-1 right-1 bg-white rounded-full shadow p-0.5 text-red-500 hover:text-red-700"
                title="Remove logo"
              >
                <FiX size={14} />
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="text-sm file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-opacity-90 cursor-pointer"
          />
        </div>
      </div>

      <ModalActions
        onClose={onClose}
        onSubmit={handleSubmit}
        submitting={mutation.isPending}
        isEdit={isEdit}
      />
    </Modal>
  );
};

// ---------- MAIN PARTNERS PAGE ----------
const Partners = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const { data: partners = [], isLoading } = useQuery({
    queryKey: ["partners"],
    queryFn: fetchPartners,
  });

  const deleteMutation = useMutation({
    mutationFn: deletePartner,
    onSuccess: () => {
      queryClient.invalidateQueries(["partners"]);
      toast.success("Partner deleted successfully!");
    },
    onError: () => {
      toast.error("Failed to delete partner");
    },
  });

  const handleEdit = (item) => {
    setSelected(item);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setSelected(null);
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    if (!confirm("Are you sure you want to delete this partner?")) return;
    deleteMutation.mutate(id);
  };

  const handleClose = () => {
    setModalOpen(false);
    setSelected(null);
  };

  if (isLoading) return <Loader />;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Partners</h2>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90"
        >
          <FiPlus /> Add New
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {partners.map((item) => (
          <div key={item.id} className="border p-4 rounded bg-white dark:bg-boxdark">
            <h3 className="font-semibold capitalize">{item.name}</h3>
            {item.logo && (
              <img
                src={item.logo}
                alt={item.name}
                className="h-10 w-10 object-contain mt-2 mb-2"
              />
            )}
            <div className="flex justify-end gap-2 text-primary">
              <button onClick={() => handleEdit(item)}>
                <FiEdit />
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="text-red-500"
                disabled={deleteMutation.isPending}
              >
                <FiTrash />
              </button>
            </div>
          </div>
        ))}
        {partners.length === 0 && (
          <p className="text-gray-500">No partners found.</p>
        )}
      </div>

      <PartnerModal isOpen={modalOpen} onClose={handleClose} data={selected} />
    </div>
  );
};

export default Partners;
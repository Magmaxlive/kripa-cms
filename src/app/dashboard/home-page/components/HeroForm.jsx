"use client";
import React, { useState } from "react";
import axios from "axios";
import { baseURL } from "@/auth/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FiEdit, FiTrash, FiPlus, FiX } from "react-icons/fi";
import { toast } from "react-toastify";

// ---------- API FUNCTIONS ----------
const fetchHeroContent = () => axios.get(`${baseURL}/hero_content/`).then(res => res.data);
const fetchHeroVideo = () => axios.get(`${baseURL}/hero_video/`).then(res => res.data);
const fetchHeroFeatures = () => axios.get(`${baseURL}/hero_features/`).then(res => res.data);

const updateHeroContent = (data) => axios.put(`${baseURL}/hero_content_update/${data.id}/`, data).then(res => res.data);
const updateHeroVideo = (data) => axios.put(`${baseURL}/hero_video_update/${data.id}/`, data).then(res => res.data);
const addHeroFeature = (data) => axios.post(`${baseURL}/hero_features/`, data).then(res => res.data);
const updateHeroFeature = ({ id, data }) => axios.put(`${baseURL}/hero_feature_update/${id}/`, data).then(res => res.data);
const deleteHeroFeature = (id) => axios.delete(`${baseURL}/hero_feature_update/${id}/`);

// ---------- REUSABLE MODAL WRAPPER ----------
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
    <label htmlFor={id} className="text-sm font-medium">{label}</label>
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

// ---------- HERO CONTENT MODAL ----------
const HeroContentModal = ({ isOpen, onClose, data }) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    badge_text: data?.badge_text || "",
    badge_icon: data?.badge_icon || "",
    main_heading: data?.main_heading || "",
    short_description: data?.short_description || "",
  });

  React.useEffect(() => {
    if (data) {
      setForm({
        id: data.id,
        badge_text: data.badge_text || "",
        badge_icon: data.badge_icon || "",
        main_heading: data.main_heading || "",
        short_description: data.short_description || "",
      });
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: updateHeroContent,
    onSuccess: () => {
      queryClient.invalidateQueries(["heroContent"]);
      toast.success("Hero content updated successfully!");
      onClose();
    },
    onError: () => {
      toast.error("Failed to update hero content.");
    },
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Hero Content">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Badge Text"
            id="badge_text"
            value={form.badge_text}
            onChange={e => setForm({ ...form, badge_text: e.target.value })}
          />
          <Field
            label="Badge Icon"
            id="badge_icon"
            value={form.badge_icon}
            onChange={e => setForm({ ...form, badge_icon: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Main Heading"
            id="main_heading"
            value={form.main_heading}
            onChange={e => setForm({ ...form, main_heading: e.target.value })}
          />
          <Field
            label="Short Description"
            id="short_description"
            value={form.short_description}
            onChange={e => setForm({ ...form, short_description: e.target.value })}
          />
        </div>
      </div>
      <ModalActions
        onClose={onClose}
        onSubmit={() => mutation.mutate(form)}
        submitting={mutation.isPending}
        isEdit={true}
      />
    </Modal>
  );
};

// ---------- HERO VIDEO MODAL ----------
const HeroVideoModal = ({ isOpen, onClose, data }) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    video_link: data?.video_link || "",
    card_icon: data?.card_icon || "",
    card_title: data?.card_title || "",
    card_description: data?.card_description || "",
  });

  React.useEffect(() => {
    if (data) {
      setForm({
        id: data.id,
        video_link: data.video_link || "",
        card_icon: data.card_icon || "",
        card_title: data.card_title || "",
        card_description: data.card_description || "",
      });
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: updateHeroVideo,
    onSuccess: () => {
      queryClient.invalidateQueries(["heroVideo"]);
      toast.success("Hero video updated successfully!");
      onClose();
    },
    onError: () => {
      toast.error("Failed to update hero video.");
    },
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Hero Video Section">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Video Link"
            id="video_link"
            value={form.video_link}
            onChange={e => setForm({ ...form, video_link: e.target.value })}
          />
          <Field
            label="Card Icon"
            id="card_icon"
            value={form.card_icon}
            onChange={e => setForm({ ...form, card_icon: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Card Title"
            id="card_title"
            value={form.card_title}
            onChange={e => setForm({ ...form, card_title: e.target.value })}
          />
          <Field
            label="Card Description"
            id="card_description"
            value={form.card_description}
            onChange={e => setForm({ ...form, card_description: e.target.value })}
          />
        </div>
      </div>
      <ModalActions
        onClose={onClose}
        onSubmit={() => mutation.mutate(form)}
        submitting={mutation.isPending}
        isEdit={true}
      />
    </Modal>
  );
};

// ---------- HERO FEATURE MODAL ----------
const HeroFeatureModal = ({ isOpen, onClose, feature }) => {
  const queryClient = useQueryClient();
  const isEdit = !!feature;
  const [form, setForm] = useState({ feature: feature?.feature || "" });

  React.useEffect(() => {
    setForm({ feature: feature?.feature || "" });
  }, [feature]);

  const mutation = useMutation({
    mutationFn: isEdit ? updateHeroFeature : addHeroFeature,
    onSuccess: () => {
      queryClient.invalidateQueries(["heroFeatures"]);
      toast.success(isEdit ? "Feature updated successfully!" : "Feature added successfully!");
      onClose();
    },
    onError: () => {
      toast.error(isEdit ? "Failed to update feature." : "Failed to add feature.");
    },
  });

  const handleSubmit = () => {
    if (isEdit) {
      mutation.mutate({ id: feature.id, data: form });
    } else {
      mutation.mutate(form);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Edit Feature" : "Add Feature"}>
      <div className="flex flex-col gap-4">
        <Field
          label="Feature"
          id="feature"
          value={form.feature}
          onChange={e => setForm({ ...form, feature: e.target.value })}
        />
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

// ---------- MAIN COMPONENT ----------
const HeroForm = () => {
  const queryClient = useQueryClient();

  const [contentModalOpen, setContentModalOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [featureModalOpen, setFeatureModalOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);

  const { data: heroData, isLoading: loadingContent } = useQuery({
    queryKey: ["heroContent"],
    queryFn: fetchHeroContent,
  });

  const { data: heroVideo, isLoading: loadingVideo } = useQuery({
    queryKey: ["heroVideo"],
    queryFn: fetchHeroVideo,
  });

  const { data: heroFeatures, isLoading: loadingFeatures } = useQuery({
    queryKey: ["heroFeatures"],
    queryFn: fetchHeroFeatures,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteHeroFeature,
    onSuccess: () => {
      queryClient.invalidateQueries(["heroFeatures"]);
      toast.success("Feature deleted successfully!");
    },
    onError: () => {
      toast.error("Failed to delete feature.");
    },
  });

  const handleAddFeature = () => {
    setSelectedFeature(null);
    setFeatureModalOpen(true);
  };

  const handleEditFeature = (feature) => {
    setSelectedFeature(feature);
    setFeatureModalOpen(true);
  };

  const handleDeleteFeature = (id) => {
    if (confirm("Are you sure you want to delete this feature?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <>
      {/* Modals */}
      <HeroContentModal
        isOpen={contentModalOpen}
        onClose={() => setContentModalOpen(false)}
        data={heroData}
      />
      <HeroVideoModal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        data={heroVideo}
      />
      <HeroFeatureModal
        isOpen={featureModalOpen}
        onClose={() => setFeatureModalOpen(false)}
        feature={selectedFeature}
      />

      <div className="flex flex-col gap-8">
        {/* Hero Content */}
        <div className="flex-col gap-8 mt-4 bg-white dark:bg-boxdark rounded-lg shadow-sm p-6 border border-stroke dark:border-strokedark">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Hero Content</h2>
            <button
              onClick={() => setContentModalOpen(true)}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90 transition"
            >
              <FiEdit /> Edit
            </button>
          </div>
          {loadingContent ? (
            <p className="text-gray-400 text-sm">Loading...</p>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="flex flex-col gap-3 w-full">
                  <label>Badge Text</label>
                  <p className="border h-12 w-full rounded-md p-3 border-gray-300 flex items-center">
                    {heroData?.badge_text || "—"}
                  </p>
                </div>
                <div className="flex flex-col gap-3 w-full">
                  <label>Badge Icon</label>
                  <p className="border h-12 w-full rounded-md p-3 border-gray-300 flex items-center">
                    {heroData?.badge_icon || "—"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="flex flex-col gap-3 w-full">
                  <label>Main Heading</label>
                  <p className="border h-12 w-full rounded-md p-3 border-gray-300 flex items-center">
                    {heroData?.main_heading || "—"}
                  </p>
                </div>
                <div className="flex flex-col gap-3 w-full">
                  <label>Short Description</label>
                  <p className="border h-12 w-full rounded-md p-3 border-gray-300 flex items-center">
                    {heroData?.short_description || "—"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Hero Video Section */}
        <div className="flex-col gap-8 mt-4 bg-white dark:bg-boxdark rounded-lg shadow-sm p-6 border border-stroke dark:border-strokedark">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Hero Video Section</h2>
            <button
              onClick={() => setVideoModalOpen(true)}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90 transition"
            >
              <FiEdit /> Edit
            </button>
          </div>
          {loadingVideo ? (
            <p className="text-gray-400 text-sm">Loading...</p>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="flex flex-col gap-3 w-full">
                  <label>Video Link</label>
                  <p className="border h-12 w-full overflow-y-scroll rounded-md p-3 border-gray-300 flex items-center">
                    {heroVideo?.video_link || "—"}
                  </p>
                </div>
                <div className="flex flex-col gap-3 w-full">
                  <label>Card Icon</label>
                  <p className="border h-12 w-full rounded-md p-3 border-gray-300 flex items-center">
                    {heroVideo?.card_icon || "—"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="flex flex-col gap-3 w-full">
                  <label>Card Title</label>
                  <p className="border h-12 w-full rounded-md p-3 border-gray-300 flex items-center">
                    {heroVideo?.card_title || "—"}
                  </p>
                </div>
                <div className="flex flex-col gap-3 w-full">
                  <label>Card Description</label>
                  <p className="border h-12 w-full rounded-md p-3 border-gray-300 flex items-center">
                    {heroVideo?.card_description || "—"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Hero Features Section */}
        <div className="flex-col gap-8 mt-4 bg-white dark:bg-boxdark rounded-lg shadow-sm p-6 border border-stroke dark:border-strokedark">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Hero Features</h2>
            <button
              onClick={handleAddFeature}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90 transition"
            >
              <FiPlus /> Add
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 rounded-tl-md">#</th>
                  <th className="px-4 py-3">Feature</th>
                  <th className="px-4 py-3 rounded-tr-md text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingFeatures ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-gray-400">
                      Loading...
                    </td>
                  </tr>
                ) : heroFeatures && heroFeatures.length > 0 ? (
                  heroFeatures.map((i, index) => (
                    <tr
                      key={i.id || index}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                      <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                      <td className="px-4 py-3">{i.feature || "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => handleEditFeature(i)}
                            className="text-blue-500 hover:text-blue-700 transition"
                          >
                            <FiEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteFeature(i.id)}
                            className="text-red-500 hover:text-red-700 transition"
                          >
                            <FiTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-gray-400">
                      No features added yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default HeroForm;
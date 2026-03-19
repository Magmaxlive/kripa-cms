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
const fetchTeamSection = () =>
  axios.get(`${baseURL}/team-section/`).then((res) => res.data);

const saveTeamSection = ({ id, ...data }) =>
  id
    ? axios.patch(`${baseURL}/team-section/${id}/`, data, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
    : axios.post(`${baseURL}/team-section/`, data, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

const fetchTeamMembers = () =>
  axios.get(`${baseURL}/team-members/`).then((res) => res.data);

const createTeamMember = (formData) =>
  axios.post(`${baseURL}/team-members/`, formData, {
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "multipart/form-data",
    },
  });

const updateTeamMember = (formData) => {
  const id = formData.get("id");
  formData.delete("id");
  return axios.patch(`${baseURL}/team-members/${id}/`, formData, {
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "multipart/form-data",
    },
  });
};

const deleteTeamMember = (id) =>
  axios.delete(`${baseURL}/team-members/${id}/`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });

// ---------- CONSTANTS ----------
const MAX_IMAGE_SIZE = 1 * 1024 * 1024;

const CATEGORY_OPTIONS = [
  { value: "core_member", label: "Core Member" },
  { value: "mortage_adviser", label: "Mortgage Adviser" },
  { value: "other", label: "Other" },
];

// ---------- MODAL ----------
const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-2xl" }) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      style={{ zIndex: 9999 }}
    >
      <div
        className={`bg-white dark:bg-boxdark rounded-lg shadow-2xl p-6 w-full ${maxWidth} max-h-[90vh] overflow-y-auto`}
        style={{ zIndex: 10000 }}
      >
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

// ---------- SHARED FIELDS ----------
const Field = ({ label, id, value, onChange, placeholder, error, required }) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="text-sm font-medium">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      id={id}
      type="text"
      value={value}
      onChange={onChange}
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
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <textarea
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
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
    <div className={`border rounded-md overflow-hidden dark:border-strokedark
      [&_.ck-editor__editable]:min-h-[200px] [&_.ck-editor__editable]:text-sm [&_.ck-editor__editable]:px-4
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

const SelectField = ({ label, id, value, onChange, options, error, required }) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="text-sm font-medium">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <select
      id={id}
      value={value}
      onChange={onChange}
      className={`border h-11 w-full rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-meta-4 transition bg-white dark:bg-meta-4
        ${error ? "border-red-400 focus:ring-red-400" : "border-gray-300 dark:border-strokedark"}`}
    >
      <option value="">Select {label}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

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

const DisplayField = ({ label, value }) => (
  <div className="flex flex-col gap-2 w-full">
    <label className="text-sm font-medium">{label}</label>
    <p className="border min-h-12 w-full rounded-md p-3 border-gray-300 text-sm text-gray-700 dark:text-gray-300 dark:border-strokedark">
      {value || "—"}
    </p>
  </div>
);

// ---------- IMAGE UPLOAD FIELD ----------
const ImageUploadField = ({
  label,
  fieldName,
  existingUrl,
  file,
  onFileChange,
  onRemove,
  fileInputRef,
  required,
  error,
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
      <span className="text-gray-400 font-normal ml-1">(image, max 1 MB)</span>
    </label>
    {(existingUrl || file) && (
      <div className="relative w-28 h-28 border rounded-md overflow-hidden bg-gray-50 flex items-center justify-center">
        <img
          src={file ? URL.createObjectURL(file) : existingUrl}
          alt={label}
          className="max-h-full max-w-full object-cover"
        />
        <button
          type="button"
          onClick={() => onRemove(fieldName)}
          className="absolute top-1 right-1 bg-white rounded-full shadow p-0.5 text-red-500 hover:text-red-700"
        >
          <FiX size={14} />
        </button>
      </div>
    )}
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      onChange={(e) => onFileChange(e, fieldName)}
      className="text-sm file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-opacity-90 cursor-pointer"
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

// ---------- TEAM SECTION MODAL ----------
const TeamSectionModal = ({ isOpen, onClose, data }) => {
  const queryClient = useQueryClient();

  const [form, setForm] = useState(() => ({
    minor_heading: data?.minor_heading || "",
    main_heading: data?.main_heading || "",
    paragraph: data?.paragraph || "",
  }));
  const [errors, setErrors] = useState({});

  React.useEffect(() => {
    setForm({
      minor_heading: data?.minor_heading || "",
      main_heading: data?.main_heading || "",
      paragraph: data?.paragraph || "",
    });
    setErrors({});
  }, [data]);

  const mutation = useMutation({
    mutationFn: saveTeamSection,
    onSuccess: () => {
      queryClient.invalidateQueries(["team-section"]);
      toast.success("Team section updated successfully!");
      onClose();
    },
    onError: () => toast.error("Failed to update team section."),
  });

  const validate = () => {
    const e = {};
    if (!form.minor_heading.trim()) e.minor_heading = "Minor heading is required.";
    if (!form.main_heading.trim()) e.main_heading = "Main heading is required.";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setErrors({});
    mutation.mutate({ id: data?.id, ...form });
  };

  const set = (key) => (ev) => {
    setForm((f) => ({ ...f, [key]: ev.target.value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Team Section">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Minor Heading"
            id="minor_heading"
            required
            value={form.minor_heading}
            error={errors.minor_heading}
            onChange={set("minor_heading")}
            placeholder="Meet Our Team"
          />
          <Field
            label="Main Heading"
            id="main_heading"
            required
            value={form.main_heading}
            error={errors.main_heading}
            onChange={set("main_heading")}
            placeholder="The People Behind Our Success"
          />
        </div>
        <TextareaField
          label="Paragraph"
          id="paragraph"
          value={form.paragraph}
          error={errors.paragraph}
          onChange={set("paragraph")}
          placeholder="Describe the team section..."
          rows={4}
        />
      </div>
      <ModalActions
        onClose={onClose}
        onSubmit={handleSubmit}
        submitting={mutation.isPending}
        isEdit={true}
      />
    </Modal>
  );
};

// ---------- TEAM MEMBER MODAL ----------
const EMPTY_MEMBER_FORM = {
  name: "",
  position: "",
  category: "",
  description: "",
};

const formFromMember = (data) =>
  data
    ? {
        name: data.name || "",
        position: data.position || "",
        category: data.category || "",
        description: data.description || "",
      }
    : EMPTY_MEMBER_FORM;

const TeamMemberModal = ({ isOpen, onClose, data }) => {
  const queryClient = useQueryClient();
  const isEdit = !!data;
  const [form, setForm] = useState(() => formFromMember(data));
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});
  const imageRef = React.useRef(null);

  React.useEffect(() => {
    setForm(formFromMember(data));
    setImageFile(null);
    setErrors({});
  }, [data]);

  const set = (key) => (ev) => {
    setForm((f) => ({ ...f, [key]: ev.target.value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((ev) => ({ ...ev, image: "Only image files are allowed." }));
      e.target.value = "";
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setErrors((ev) => ({ ...ev, image: "Image must be 1 MB or smaller." }));
      e.target.value = "";
      return;
    }
    setImageFile(file);
    setErrors((ev) => ({ ...ev, image: "" }));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    if (imageRef.current) imageRef.current.value = "";
  };

  const mutation = useMutation({
    mutationFn: isEdit ? updateTeamMember : createTeamMember,
    onSuccess: () => {
      queryClient.invalidateQueries(["team-members"]);
      toast.success(`Team member ${isEdit ? "updated" : "added"} successfully!`);
      onClose();
    },
    onError: () => toast.error(`Failed to ${isEdit ? "update" : "add"} team member.`),
  });

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required.";
    if (!form.position.trim()) e.position = "Position is required.";
    if (!form.category) e.category = "Category is required.";
    if (!isEdit && !imageFile) e.image = "Image is required.";
    // description is optional — no validation needed
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setErrors({});
    const fd = new FormData();
    if (isEdit) fd.append("id", data.id);
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (imageFile) fd.append("image", imageFile);
    mutation.mutate(fd);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Edit Team Member" : "Add Team Member"}>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Name"
            id="name"
            required
            value={form.name}
            error={errors.name}
            onChange={set("name")}
            placeholder="John Doe"
          />
          <Field
            label="Position"
            id="position"
            required
            value={form.position}
            error={errors.position}
            onChange={set("position")}
            placeholder="Senior Advisor"
          />
        </div>
        <SelectField
          label="Category"
          id="category"
          required
          value={form.category}
          error={errors.category}
          onChange={set("category")}
          options={CATEGORY_OPTIONS}
        />
        <RichTextField
          label="Description"
          value={form.description}
          error={errors.description}
          onChange={(val) => {
            setForm((f) => ({ ...f, description: val }));
            setErrors((e) => ({ ...e, description: "" }));
          }}
          editorKey={`${data?.id ?? "new"}-${isOpen}`}
        />
        <ImageUploadField
          label="Photo"
          fieldName="image"
          required={!isEdit}
          existingUrl={data?.image}
          file={imageFile}
          error={errors.image}
          onFileChange={handleFileChange}
          onRemove={handleRemoveImage}
          fileInputRef={imageRef}
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

// ---------- CATEGORY BADGE ----------
const CategoryBadge = ({ value }) => {
  const opt = CATEGORY_OPTIONS.find((o) => o.value === value);
  const label = opt?.label || value || "—";
  const colors = {
    core_member: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    mortage_adviser: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    other: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
  };
  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${colors[value] || colors.other}`}>
      {label}
    </span>
  );
};

// ---------- MAIN COMPONENT ----------
const TeamSectionForm = () => {
  const queryClient = useQueryClient();
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const { data: sectionResponse, isLoading: loadingSection } = useQuery({
    queryKey: ["team-section"],
    queryFn: fetchTeamSection,
  });
  const sectionData = Array.isArray(sectionResponse)
    ? sectionResponse[0] || null
    : sectionResponse || null;

  const { data: members = [], isLoading: loadingMembers } = useQuery({
    queryKey: ["team-members"],
    queryFn: fetchTeamMembers,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTeamMember,
    onSuccess: () => {
      queryClient.invalidateQueries(["team-members"]);
      toast.success("Team member deleted successfully!");
    },
    onError: () => toast.error("Failed to delete team member."),
  });

  const handleEditMember = (item) => {
    setSelectedMember(item);
    setMemberModalOpen(true);
  };
  const handleAddMember = () => {
    setSelectedMember(null);
    setMemberModalOpen(true);
  };
  const handleDeleteMember = (id) => {
    if (confirm("Are you sure you want to delete this team member?"))
      deleteMutation.mutate(id);
  };

  return (
    <>
      <TeamSectionModal
        isOpen={sectionModalOpen}
        onClose={() => setSectionModalOpen(false)}
        data={sectionData}
      />
      <TeamMemberModal
        key={`${selectedMember?.id ?? "new"}-${memberModalOpen}`}
        isOpen={memberModalOpen}
        onClose={() => {
          setMemberModalOpen(false);
          setSelectedMember(null);
        }}
        data={selectedMember}
      />

      <div className="flex flex-col gap-8">

        {/* ── Team Section header card ── */}
        <div className="bg-white dark:bg-boxdark rounded-lg shadow-sm p-6 border border-stroke dark:border-strokedark">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Team Section</h2>
            <button
              onClick={() => setSectionModalOpen(true)}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90 transition"
            >
              <FiEdit /> Edit
            </button>
          </div>
          {loadingSection ? (
            <p className="text-gray-400 text-sm">Loading...</p>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <DisplayField label="Minor Heading" value={sectionData?.minor_heading} />
                <DisplayField label="Main Heading" value={sectionData?.main_heading} />
              </div>
              <DisplayField label="Paragraph" value={sectionData?.paragraph} />
            </div>
          )}
        </div>

        {/* ── Team Members card grid ── */}
        <div className="bg-white dark:bg-boxdark rounded-lg shadow-sm p-6 border border-stroke dark:border-strokedark">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Team Members</h2>
            <button
              onClick={handleAddMember}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90 transition"
            >
              <FiPlus /> Add
            </button>
          </div>

          {loadingMembers ? (
            <p className="text-gray-400 text-sm">Loading...</p>
          ) : members.length === 0 ? (
            <p className="text-gray-400 text-sm">No team members added yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {members.map((item) => (
                <div
                  key={item.id}
                  className="group relative rounded-xl overflow-hidden border border-gray-200 dark:border-strokedark shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-meta-4"
                >
                  <div className="relative h-52 w-full bg-gray-100 dark:bg-gray-800">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover object-top"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-300 text-xs">
                        No image
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditMember(item)}
                        className="bg-white text-blue-500 hover:text-blue-700 p-1.5 rounded-full shadow"
                        title="Edit"
                      >
                        <FiEdit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteMember(item.id)}
                        className="bg-white text-red-500 hover:text-red-700 p-1.5 rounded-full shadow"
                        title="Delete"
                        disabled={deleteMutation.isPending}
                      >
                        <FiTrash size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="p-4 flex flex-col gap-1.5">
                    <h3 className="font-semibold text-sm text-gray-800 dark:text-white truncate">
                      {item.name || "—"}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {item.position || "—"}
                    </p>
                    <CategoryBadge value={item.category} />
                    
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </>
  );
};

export default TeamSectionForm;
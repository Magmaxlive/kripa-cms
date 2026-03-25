"use client";
import React, { useState } from "react";
import axios from "axios";
import { baseURL} from "@/auth/auth";
import { FiEdit, FiX } from "react-icons/fi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

// ---------- API FUNCTIONS ----------
const multipartHeaders = {"Content-Type": "multipart/form-data" };

// Contact Card Section
const fetchContactCard = () => axios.get(`${baseURL}/contact-card-section/`).then(r => { const d = r.data; return Array.isArray(d) ? d[0] || null : d || null; });
const saveContactCard  = ({ id, ...data }) => id ? axios.patch(`${baseURL}/contact-card-section/${id}/`, data) : axios.post(`${baseURL}/contact-card-section/`, data);

// Contact
const fetchContact = () => axios.get(`${baseURL}/contact/`).then(r => { const d = r.data; return Array.isArray(d) ? d[0] || null : d || null; });
const saveContact  = (formData) => { const id = formData.get("id"); formData.delete("id"); return id ? axios.patch(`${baseURL}/contact/${id}/`, formData, { headers: multipartHeaders }) : axios.post(`${baseURL}/contact/`, formData, { headers: multipartHeaders }); };

// Social Media
const fetchSocialMedia = () => axios.get(`${baseURL}/social-media/`).then(r => { const d = r.data; return Array.isArray(d) ? d[0] || null : d || null; });
const saveSocialMedia  = ({ id, ...data }) => id ? axios.patch(`${baseURL}/social-media/${id}/`, data) : axios.post(`${baseURL}/social-media/`, data);

// Office Timings
const fetchOfficeTimings = () => axios.get(`${baseURL}/office-timings/`).then(r => { const d = r.data; return Array.isArray(d) ? d[0] || null : d || null; });
const saveOfficeTimings  = ({ id, ...data }) => id ? axios.patch(`${baseURL}/office-timings/${id}/`, data) : axios.post(`${baseURL}/office-timings/`, data);

// ---------- CONSTANTS ----------
const MAX_IMAGE_SIZE = 1 * 1024 * 1024;

// ---------- MODAL ----------
const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-2xl" }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" style={{ zIndex: 9999 }}>
      <div
        className={`bg-white dark:bg-boxdark rounded-lg shadow-2xl p-6 w-full ${maxWidth} max-h-[90vh] overflow-y-auto`}
        style={{ zIndex: 10000 }}
      >
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

const ModalActions = ({ onClose, onSubmit, submitting, isEdit }) => (
  <div className="flex justify-end gap-3 mt-6">
    <button onClick={onClose} className="px-4 py-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 transition">Cancel</button>
    <button onClick={onSubmit} disabled={submitting}
      className="px-4 py-2 rounded bg-primary text-white hover:bg-opacity-90 transition disabled:opacity-60">
      {submitting ? "Saving..." : isEdit ? "Update" : "Save"}
    </button>
  </div>
);

const DisplayField = ({ label, value }) => (
  <div className="flex flex-col gap-2 w-full">
    <label className="text-sm font-medium">{label}</label>
    <p className="border min-h-10 w-full rounded-md p-3 border-gray-300 text-sm text-gray-700 dark:text-gray-300 dark:border-strokedark break-all">
      {value || "—"}
    </p>
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
      <div className="relative w-40 h-24 border rounded-md overflow-hidden bg-gray-50 flex items-center justify-center">
        <img src={file ? URL.createObjectURL(file) : existingUrl} alt={label} className="max-h-full max-w-full object-cover" />
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

// ════════════════════════════════════════════════════
// 1. CONTACT CARD SECTION MODAL
// ════════════════════════════════════════════════════
const ContactCardModal = ({ isOpen, onClose, data }) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(() => ({
    title:       data?.title       || "",
    description: data?.description || "",
    button_text: data?.button_text || "",
    button_link: data?.button_link || "",
  }));
  const [errors, setErrors] = useState({});

  React.useEffect(() => {
    setForm({
      title:       data?.title       || "",
      description: data?.description || "",
      button_text: data?.button_text || "",
      button_link: data?.button_link || "",
    });
    setErrors({});
  }, [data]);

  const mutation = useMutation({
    mutationFn: saveContactCard,
    onSuccess: () => { queryClient.invalidateQueries(["contact-card-section"]); toast.success("Contact card updated!"); onClose(); },
    onError: () => toast.error("Failed to update contact card."),
  });

  const validate = () => {
    const e = {};
    if (!form.title.trim())       e.title       = "Title is required.";
    if (!form.description.trim()) e.description = "Description is required.";
    if (!form.button_text.trim()) e.button_text = "Button text is required.";
    if (!form.button_link.trim()) e.button_link = "Button link is required.";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    mutation.mutate({ id: data?.id, ...form });
  };

  const set = (key) => (ev) => {
    setForm((f) => ({ ...f, [key]: ev.target.value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Contact Card Section">
      <div className="flex flex-col gap-4">
        <Field label="Title" id="title" required value={form.title} error={errors.title} onChange={set("title")} placeholder="Get In Touch" />
        <TextareaField label="Description" id="description" required value={form.description} error={errors.description}
          onChange={set("description")} placeholder="We'd love to hear from you..." rows={3} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Button Text" id="button_text" required value={form.button_text} error={errors.button_text}
            onChange={set("button_text")} placeholder="Contact Us" />
          <Field label="Button Link" id="button_link" required value={form.button_link} error={errors.button_link}
            onChange={set("button_link")} placeholder="https://example.com/contact" />
        </div>
      </div>
      <ModalActions onClose={onClose} onSubmit={handleSubmit} submitting={mutation.isPending} isEdit={!!data?.id} />
    </Modal>
  );
};

// ════════════════════════════════════════════════════
// 2. CONTACT MODAL
// ════════════════════════════════════════════════════
const ContactModal = ({ isOpen, onClose, data }) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(() => ({
    phone:         data?.phone         || "",
    whatsapp:      data?.whatsapp      || "",
    email:         data?.email         || "",
    location:      data?.location      || "",
    location_link: data?.location_link || "",
    map_embed:     data?.map_embed     || "",
  }));
  const [bannerFile, setBannerFile] = useState(null);
  const [errors, setErrors] = useState({});
  const bannerRef = React.useRef(null);

  React.useEffect(() => {
    setForm({
      phone:         data?.phone         || "",
      whatsapp:      data?.whatsapp      || "",
      email:         data?.email         || "",
      location:      data?.location      || "",
      location_link: data?.location_link || "",
      map_embed:     data?.map_embed     || "",
    });
    setBannerFile(null);
    setErrors({});
  }, [data]);

  const set = (key) => (ev) => {
    setForm((f) => ({ ...f, [key]: ev.target.value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setErrors((ev) => ({ ...ev, banner_image: "Only image files allowed." })); e.target.value = ""; return; }
    if (file.size > MAX_IMAGE_SIZE) { setErrors((ev) => ({ ...ev, banner_image: "Image must be 1 MB or smaller." })); e.target.value = ""; return; }
    setBannerFile(file);
    setErrors((ev) => ({ ...ev, banner_image: "" }));
  };

  const handleRemoveBanner = () => { setBannerFile(null); if (bannerRef.current) bannerRef.current.value = ""; };

  const mutation = useMutation({
    mutationFn: saveContact,
    onSuccess: () => { queryClient.invalidateQueries(["contact"]); toast.success("Contact info updated!"); onClose(); },
    onError: () => toast.error("Failed to update contact info."),
  });

  const validate = () => {
    const e = {};
    if (!form.phone.trim())    e.phone    = "Phone is required.";
    if (!form.whatsapp.trim()) e.whatsapp = "WhatsApp is required.";
    if (!form.email.trim())    e.email    = "Email is required.";
    if (!form.location.trim()) e.location = "Location is required.";
    if (!form.location_link.trim()) e.location_link = "Location Link is required.";
    if (!form.map_embed.trim()) e.map_embed = "Map embed is required.";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    const fd = new FormData();
    if (data?.id) fd.append("id", data.id);
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (bannerFile) fd.append("banner_image", bannerFile);
    mutation.mutate(fd);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Contact Info" maxWidth="max-w-3xl">
      <div className="flex flex-col gap-4">
        <ImageUploadField
          label="Banner Image" fieldName="banner_image"
          existingUrl={data?.banner_image} file={bannerFile} error={errors.banner_image}
          onFileChange={handleFileChange} onRemove={handleRemoveBanner} fileInputRef={bannerRef}
        />
        <hr className="border-gray-200 dark:border-strokedark" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Phone" id="phone" required value={form.phone} error={errors.phone}
            onChange={set("phone")} placeholder="+44 1234 567890" />
          <Field label="WhatsApp" id="whatsapp" required value={form.whatsapp} error={errors.whatsapp}
            onChange={set("whatsapp")} placeholder="+44 7911 123456" />
        </div>
        <Field label="Email" id="email" required type="email" value={form.email} error={errors.email}
          onChange={set("email")} placeholder="hello@example.com" />
        <TextareaField label="Location" id="location" required value={form.location} error={errors.location}
          onChange={set("location")} placeholder="123 Street Name, City, Country" rows={2} />
        <Field label="Location Link" id="location_link" required value={form.location_link} error={errors.location_link}
          onChange={set("location_link")} placeholder="https://maps.google.com/..." />
        <Field label="Map Embed URL" id="map_embed" required value={form.map_embed} error={errors.map_embed}
          onChange={set("map_embed")} placeholder="https://www.google.com/maps/embed?pb=..." />
      </div>
      <ModalActions onClose={onClose} onSubmit={handleSubmit} submitting={mutation.isPending} isEdit={!!data?.id} />
    </Modal>
  );
};

// ════════════════════════════════════════════════════
// 3. SOCIAL MEDIA MODAL
// ════════════════════════════════════════════════════
const SOCIAL_FIELDS = [
  { key: "facebook",  label: "Facebook",  placeholder: "https://facebook.com/yourpage" },
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/yourhandle" },
  { key: "linkedin",  label: "LinkedIn",  placeholder: "https://linkedin.com/company/yourcompany" },
  { key: "youtube",   label: "YouTube",   placeholder: "https://youtube.com/@yourchannel" },
  { key: "twitter",   label: "Twitter / X", placeholder: "https://twitter.com/yourhandle" },
];

const SocialMediaModal = ({ isOpen, onClose, data }) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(() =>
    Object.fromEntries(SOCIAL_FIELDS.map(({ key }) => [key, data?.[key] || ""]))
  );
  const [errors, setErrors] = useState({});

  React.useEffect(() => {
    setForm(Object.fromEntries(SOCIAL_FIELDS.map(({ key }) => [key, data?.[key] || ""])));
    setErrors({});
  }, [data]);

  const mutation = useMutation({
    mutationFn: saveSocialMedia,
    onSuccess: () => { queryClient.invalidateQueries(["social-media"]); toast.success("Social media links updated!"); onClose(); },
    onError: () => toast.error("Failed to update social media links."),
  });

  const handleSubmit = () => {
    mutation.mutate({ id: data?.id, ...form });
  };

  const set = (key) => (ev) => setForm((f) => ({ ...f, [key]: ev.target.value }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Social Media Links">
      <div className="flex flex-col gap-4">
        {SOCIAL_FIELDS.map(({ key, label, placeholder }) => (
          <Field key={key} label={label} id={key} value={form[key]} error={errors[key]}
            onChange={set(key)} placeholder={placeholder} />
        ))}
      </div>
      <ModalActions onClose={onClose} onSubmit={handleSubmit} submitting={mutation.isPending} isEdit={!!data?.id} />
    </Modal>
  );
};

// ════════════════════════════════════════════════════
// 4. OFFICE TIMINGS MODAL
// ════════════════════════════════════════════════════
const OfficeTimingsModal = ({ isOpen, onClose, data }) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(() => ({
    mon_fri:  data?.mon_fri  || "",
    saturday: data?.saturday || "",
    sunday:   data?.sunday   || "",
  }));
  const [errors, setErrors] = useState({});

  React.useEffect(() => {
    setForm({ mon_fri: data?.mon_fri || "", saturday: data?.saturday || "", sunday: data?.sunday || "" });
    setErrors({});
  }, [data]);

  const mutation = useMutation({
    mutationFn: saveOfficeTimings,
    onSuccess: () => { queryClient.invalidateQueries(["office-timings"]); toast.success("Office timings updated!"); onClose(); },
    onError: () => toast.error("Failed to update office timings."),
  });

  const validate = () => {
    const e = {};
    if (!form.mon_fri.trim())  e.mon_fri  = "Monday–Friday timing is required.";
    if (!form.saturday.trim()) e.saturday = "Saturday timing is required.";
    if (!form.sunday.trim())   e.sunday   = "Sunday timing is required.";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    mutation.mutate({ id: data?.id, ...form });
  };

  const set = (key) => (ev) => {
    setForm((f) => ({ ...f, [key]: ev.target.value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Office Timings" maxWidth="max-w-lg">
      <div className="flex flex-col gap-4">
        <Field label="Monday – Friday" id="mon_fri" required value={form.mon_fri} error={errors.mon_fri}
          onChange={set("mon_fri")} placeholder="9:00 AM – 6:00 PM" />
        <Field label="Saturday" id="saturday" required value={form.saturday} error={errors.saturday}
          onChange={set("saturday")} placeholder="10:00 AM – 4:00 PM" />
        <Field label="Sunday" id="sunday" required value={form.sunday} error={errors.sunday}
          onChange={set("sunday")} placeholder="Closed" />
      </div>
      <ModalActions onClose={onClose} onSubmit={handleSubmit} submitting={mutation.isPending} isEdit={!!data?.id} />
    </Modal>
  );
};

// ════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════
const ContactSectionForm = () => {
  const [cardModalOpen,    setCardModalOpen]    = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [socialModalOpen,  setSocialModalOpen]  = useState(false);
  const [timingsModalOpen, setTimingsModalOpen] = useState(false);

  const { data: cardData,    isLoading: loadingCard    } = useQuery({ queryKey: ["contact-card-section"], queryFn: fetchContactCard    });
  const { data: contactData, isLoading: loadingContact } = useQuery({ queryKey: ["contact"],              queryFn: fetchContact         });
  const { data: socialData,  isLoading: loadingSocial  } = useQuery({ queryKey: ["social-media"],         queryFn: fetchSocialMedia     });
  const { data: timingsData, isLoading: loadingTimings } = useQuery({ queryKey: ["office-timings"],       queryFn: fetchOfficeTimings   });

  return (
    <>
      <ContactCardModal   isOpen={cardModalOpen}    onClose={() => setCardModalOpen(false)}    data={cardData} />
      <ContactModal       isOpen={contactModalOpen} onClose={() => setContactModalOpen(false)} data={contactData} />
      <SocialMediaModal   isOpen={socialModalOpen}  onClose={() => setSocialModalOpen(false)}  data={socialData} />
      <OfficeTimingsModal isOpen={timingsModalOpen} onClose={() => setTimingsModalOpen(false)} data={timingsData} />

      <div className="flex flex-col gap-8">

        {/* ── Contact Card Section ── */}
        <div className="bg-white dark:bg-boxdark rounded-lg shadow-sm p-6 border border-stroke dark:border-strokedark">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Contact Card Section</h2>
            <button onClick={() => setCardModalOpen(true)}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90 transition">
              <FiEdit /> Edit
            </button>
          </div>
          {loadingCard ? <p className="text-gray-400 text-sm">Loading...</p> : (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <DisplayField label="Title"       value={cardData?.title} />
                <DisplayField label="Button Text" value={cardData?.button_text} />
              </div>
              <DisplayField label="Button Link"  value={cardData?.button_link} />
              <DisplayField label="Description"  value={cardData?.description} />
            </div>
          )}
        </div>

        {/* ── Contact Info ── */}
        <div className="bg-white dark:bg-boxdark rounded-lg shadow-sm p-6 border border-stroke dark:border-strokedark">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Contact Info</h2>
            <button onClick={() => setContactModalOpen(true)}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90 transition">
              <FiEdit /> Edit
            </button>
          </div>
          {loadingContact ? <p className="text-gray-400 text-sm">Loading...</p> : (
            <div className="flex flex-col gap-4">
              {contactData?.banner_image && (
                <div>
                  <label className="text-sm font-medium block mb-1.5">Banner Image</label>
                  <img src={contactData.banner_image} alt="Banner" className="h-32 rounded-md object-cover border border-gray-200 dark:border-strokedark" />
                </div>
              )}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <DisplayField label="Phone"     value={contactData?.phone} />
                <DisplayField label="WhatsApp"  value={contactData?.whatsapp} />
              </div>
              <DisplayField label="Email"         value={contactData?.email} />
              <DisplayField label="Location"      value={contactData?.location} />
              <DisplayField label="Location Link" value={contactData?.location_link} />
              <DisplayField label="Map Embed URL" value={contactData?.map_embed} />
            </div>
          )}
        </div>

        {/* ── Social Media + Office Timings side by side ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Social Media */}
          <div className="bg-white dark:bg-boxdark rounded-lg shadow-sm p-6 border border-stroke dark:border-strokedark">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Social Media</h2>
              <button onClick={() => setSocialModalOpen(true)}
                className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90 transition">
                <FiEdit /> Edit
              </button>
            </div>
            {loadingSocial ? <p className="text-gray-400 text-sm">Loading...</p> : (
              <div className="flex flex-col gap-3">
                {SOCIAL_FIELDS.map(({ key, label }) => (
                  <DisplayField key={key} label={label} value={socialData?.[key]} />
                ))}
              </div>
            )}
          </div>

          {/* Office Timings */}
          <div className="bg-white dark:bg-boxdark rounded-lg shadow-sm p-6 border border-stroke dark:border-strokedark">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Office Timings</h2>
              <button onClick={() => setTimingsModalOpen(true)}
                className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90 transition">
                <FiEdit /> Edit
              </button>
            </div>
            {loadingTimings ? <p className="text-gray-400 text-sm">Loading...</p> : (
              <div className="flex flex-col gap-3">
                <DisplayField label="Monday – Friday" value={timingsData?.mon_fri} />
                <DisplayField label="Saturday"        value={timingsData?.saturday} />
                <DisplayField label="Sunday"          value={timingsData?.sunday} />
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default ContactSectionForm;
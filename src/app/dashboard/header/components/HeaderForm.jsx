"use client";
import React, { useState } from "react";
import axios from "axios";
import { baseURL, authToken } from "@/auth/auth";
import { FiEdit, FiTrash, FiPlus, FiX, FiChevronDown, FiChevronUp, FiMenu } from "react-icons/fi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

// ---------- API ----------
const authHeaders      = { Authorization: `Bearer ${authToken}` };
const multipartHeaders = { ...authHeaders, "Content-Type": "multipart/form-data" };

// Header
const fetchHeader = () =>
  axios.get(`${baseURL}/header/`).then(r => {
    const d = r.data;
    return Array.isArray(d) ? d[0] || null : d || null;
  });

const saveHeader = (formData) => {
  const id = formData.get("id");
  formData.delete("id");
  return id
    ? axios.patch(`${baseURL}/header/${id}/`, formData, { headers: multipartHeaders })
    : axios.post(`${baseURL}/header/`, formData, { headers: multipartHeaders });
};

// Menu
const fetchMenu   = () => axios.get(`${baseURL}/menu/`).then(r => r.data);
const createMenu  = (data) => axios.post(`${baseURL}/menu/`, data, { headers: authHeaders });
const updateMenu  = (data) => {
  const { id, ...rest } = data;
  return axios.patch(`${baseURL}/menu/${id}/`, rest, { headers: authHeaders });
};
const deleteMenu  = (id) => axios.delete(`${baseURL}/menu/${id}/`, { headers: authHeaders });

// ---------- CONSTANTS ----------
const MAX_FILE_SIZE = 2 * 1024 * 1024;

// ---------- MODAL ----------
const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-lg" }) => {
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

const ToggleField = ({ label, id, checked, onChange, description }) => (
  <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-strokedark">
    <div>
      <p className="text-sm font-medium">{label}</p>
      {description && <p className="text-xs text-gray-400">{description}</p>}
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
    </button>
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
    <p className="border min-h-10 w-full rounded-md p-3 border-gray-300 text-sm text-gray-700 dark:text-gray-300 dark:border-strokedark break-all">
      {value || "—"}
    </p>
  </div>
);

// ---------- FILE UPLOAD FIELD ----------
const FileUploadField = ({ label, fieldName, existingUrl, file, onFileChange, onRemove, fileInputRef, required, error }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium">
      {label}{required && <span className="text-red-500 ml-1">*</span>}
      <span className="text-gray-400 font-normal ml-1">(SVG / PNG / JPG, max 2 MB)</span>
    </label>
    {(existingUrl || file) && (
      <div className="relative w-32 h-16 border rounded-md overflow-hidden bg-gray-50 flex items-center justify-center">
        <img src={file ? URL.createObjectURL(file) : existingUrl} alt={label} className="max-h-full max-w-full object-contain" />
        <button type="button" onClick={() => onRemove(fieldName)}
          className="absolute top-1 right-1 bg-white rounded-full shadow p-0.5 text-red-500 hover:text-red-700">
          <FiX size={14} />
        </button>
      </div>
    )}
    <input ref={fileInputRef} type="file" accept="image/*,.svg"
      onChange={(e) => onFileChange(e, fieldName)}
      className="text-sm file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-opacity-90 cursor-pointer" />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

// ════════════════════════════════════════════════════
// HEADER MODAL
// ════════════════════════════════════════════════════
const HeaderModal = ({ isOpen, onClose, data }) => {
  const queryClient = useQueryClient();
  const isEdit = !!data;

  const [logoFile, setLogoFile] = useState(null);
  const [errors, setErrors]     = useState({});
  const logoRef = React.useRef(null);

  React.useEffect(() => {
    setLogoFile(null);
    setErrors({});
  }, [data, isOpen]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setErrors((ev) => ({ ...ev, logo: "File must be 2 MB or smaller." }));
      e.target.value = ""; return;
    }
    setLogoFile(file);
    setErrors((ev) => ({ ...ev, logo: "" }));
  };

  const handleRemove = () => { setLogoFile(null); if (logoRef.current) logoRef.current.value = ""; };

  const mutation = useMutation({
    mutationFn: saveHeader,
    onSuccess: () => { queryClient.invalidateQueries(["header"]); toast.success("Header updated!"); onClose(); },
    onError: () => toast.error("Failed to update header."),
  });

  const handleSubmit = () => {
    if (!isEdit && !logoFile) { setErrors({ logo: "Logo is required." }); return; }
    setErrors({});
    const fd = new FormData();
    if (data?.id) fd.append("id", data.id);
    if (logoFile) fd.append("logo", logoFile);
    mutation.mutate(fd);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Edit Header" : "Setup Header"} maxWidth="max-w-2xl">
      <div className="flex flex-col gap-4">
        <FileUploadField
          label="Logo" fieldName="logo" required={!isEdit}
          existingUrl={data?.logo} file={logoFile} error={errors.logo}
          onFileChange={handleFileChange} onRemove={handleRemove} fileInputRef={logoRef}
        />
      </div>
      <ModalActions onClose={onClose} onSubmit={handleSubmit} submitting={mutation.isPending} isEdit={isEdit} />
    </Modal>
  );
};

// ════════════════════════════════════════════════════
// MENU ITEM MODAL
// ════════════════════════════════════════════════════
const MenuModal = ({ isOpen, onClose, data, parentOptions }) => {
  const queryClient = useQueryClient();
  const isEdit = !!(data?.id);

  const [form, setForm] = useState({
    label:     "",
    link:      "",
    parent:    "",
    order:     0,
    is_active: true,
  });
  const [errors, setErrors] = useState({});

  // Sync form whenever modal opens or data changes
  React.useEffect(() => {
    if (isOpen) {
      setForm({
        label:     data?.label     || "",
        link:      data?.link      || "",
        parent:    data?.parent    != null ? data.parent : "",
        order:     data?.order     ?? 0,
        is_active: data?.is_active ?? true,
      });
      setErrors({});
    }
  }, [isOpen, data]);

  const set = (key) => (ev) => {
    setForm((f) => ({ ...f, [key]: ev.target.value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const mutation = useMutation({
    mutationFn: isEdit ? updateMenu : createMenu,
    onSuccess: () => { queryClient.invalidateQueries(["menu"]); toast.success(`Menu item ${isEdit ? "updated" : "added"}!`); onClose(); },
    onError: () => toast.error("Failed to save menu item."),
  });

  const handleSubmit = () => {
    const e = {};
    if (!form.label.trim()) e.label = "Label is required.";
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    const payload = {
      label:     form.label,
      link:      form.link || null,
      parent:    form.parent || null,
      order:     form.order !== "" ? Number(form.order) : 0,
      is_active: form.is_active,
    };
    const menuId = data?.id;
    if (isEdit && !menuId) {
      toast.error("Cannot update: menu item ID is missing.");
      return;
    }
    mutation.mutate(isEdit ? { id: menuId, ...payload } : payload);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Edit Menu Item" : "Add Menu Item"}>
      <div className="flex flex-col gap-4">
        <Field label="Label" id="label" required value={form.label} error={errors.label} onChange={set("label")} placeholder="About Us" />
        <Field label="Link"  id="link"  value={form.link}  error={errors.link}  onChange={set("link")}  placeholder="/about-us (leave blank for dropdown parent)" />

        {/* Parent — only show top-level items as options */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="parent" className="text-sm font-medium">Parent Menu Item
            <span className="text-gray-400 font-normal ml-1">(optional — makes this a submenu item)</span>
          </label>
          <select id="parent" value={form.parent ?? ""} onChange={set("parent")}
            className="border h-11 w-full rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-meta-4 bg-white dark:bg-meta-4 transition border-gray-300 dark:border-strokedark">
            <option value="">— Top level —</option>
            {parentOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <Field label="Order" id="order" value={String(form.order)} onChange={set("order")} placeholder="0" />

        <ToggleField
          label="Active"
          id="is_active"
          description="Hide this item from the frontend"
          checked={form.is_active}
          onChange={(val) => setForm((f) => ({ ...f, is_active: val }))}
        />
      </div>
      <ModalActions onClose={onClose} onSubmit={handleSubmit} submitting={mutation.isPending} isEdit={isEdit} />
    </Modal>
  );
};

// ════════════════════════════════════════════════════
// MENU TREE DISPLAY
// ════════════════════════════════════════════════════
const MenuTreeItem = ({ item, onEdit, onDelete, onAddSubmenu, deleting }) => {
  const [open, setOpen] = useState(false);
  const hasSubmenu = item.submenu && item.submenu.length > 0;

  return (
    <div className="flex flex-col">
      <div className={`flex items-center justify-between px-3 py-2.5 rounded-lg border transition
        ${item.is_active
          ? "border-gray-200 dark:border-strokedark bg-white dark:bg-meta-4"
          : "border-gray-200 dark:border-strokedark bg-gray-50 dark:bg-boxdark opacity-60"}`}>

        <div className="flex items-center gap-3 min-w-0">
          <FiMenu size={14} className="text-gray-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800 dark:text-white truncate capitalize">{item.label}</p>
            {item.link && <p className="text-xs text-gray-400 truncate">{item.link}</p>}
          </div>
          {!item.is_active && (
            <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-500 px-2 py-0.5 rounded-full shrink-0">Hidden</span>
          )}
          <span className="text-xs text-gray-300 shrink-0">#{item.order}</span>
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-3">
          <button onClick={() => onAddSubmenu(item)}
            className="text-green-500 hover:text-green-700 p-1 rounded transition" title="Add submenu item">
            <FiPlus size={14} />
          </button>
          <button onClick={() => onEdit(item)}
            className="text-blue-500 hover:text-blue-700 p-1 rounded transition" title="Edit">
            <FiEdit size={14} />
          </button>
          <button onClick={() => onDelete(item.id)}
            className="text-red-500 hover:text-red-700 p-1 rounded transition" title="Delete"
            disabled={deleting}>
            <FiTrash size={14} />
          </button>
          {hasSubmenu && (
            <button onClick={() => setOpen((v) => !v)} className="text-gray-400 hover:text-gray-600 p-1 rounded transition">
              {open ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
            </button>
          )}
        </div>
      </div>

      {/* Submenu items */}
      {hasSubmenu && open && (
        <div className="ml-6 mt-1 flex flex-col gap-1 border-l-2 border-gray-200 dark:border-strokedark pl-3">
          {item.submenu.map((sub) => (
            <div key={sub.id} className={`flex items-center justify-between px-3 py-2 rounded-lg border transition
              ${sub.is_active
                ? "border-gray-200 dark:border-strokedark bg-blue-100/50 dark:bg-meta-4"
                : "border-gray-200 dark:border-strokedark bg-gray-50 opacity-60"}`}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="min-w-0">
                  <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{sub.label}</p>
                  {sub.link && <p className="text-xs text-gray-400 truncate">{sub.link}</p>}
                </div>
                {!sub.is_active && (
                  <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-500 px-2 py-0.5 rounded-full shrink-0">Hidden</span>
                )}
                <span className="text-xs text-gray-300 shrink-0">#{sub.order}</span>
              </div>
              <div className="flex gap-1 shrink-0 ml-3">
                <button onClick={() => onEdit(sub)} className="text-blue-500 hover:text-blue-700 p-1 rounded transition" title="Edit"><FiEdit size={13} /></button>
                <button onClick={() => onDelete(sub.id)} className="text-red-500 hover:text-red-700 p-1 rounded transition" title="Delete" disabled={deleting}><FiTrash size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════
const HeaderForm = () => {
  const queryClient = useQueryClient();
  const [headerModalOpen, setHeaderModalOpen] = useState(false);
  const [menuModalOpen,   setMenuModalOpen]   = useState(false);
  const [selectedMenu,    setSelectedMenu]    = useState(null);
  const [defaultParent,   setDefaultParent]   = useState(null);

  const { data: headerData, isLoading: loadingHeader } = useQuery({ queryKey: ["header"], queryFn: fetchHeader });
  const { data: menuItems = [], isLoading: loadingMenu } = useQuery({ queryKey: ["menu"], queryFn: fetchMenu });

  const deleteMutation = useMutation({
    mutationFn: deleteMenu,
    onSuccess: () => { queryClient.invalidateQueries(["menu"]); toast.success("Menu item deleted!"); },
    onError: () => toast.error("Failed to delete menu item."),
  });

  // Build tree: top-level items with submenu nested
  // parent field is now an integer ID from the API
  const menuTree = React.useMemo(() => {
    const topLevel = menuItems.filter((m) => !m.parent);
    return topLevel.map((item) => ({
      ...item,
      submenu: menuItems.filter((m) => Number(m.parent) === Number(item.id)),
    }));
  }, [menuItems]);

  // Only top-level items can be parents
  const parentOptions = menuItems
    .filter((m) => !m.parent)
    .map((m) => ({ value: m.id, label: m.label }));

  const handleEdit       = (item) => {
    setSelectedMenu({ ...item, id: item.id, parent: item.parent ?? "" });
    setDefaultParent(null);
    setMenuModalOpen(true);
  };
  const handleAdd        = ()     => { setSelectedMenu(null); setDefaultParent(null); setMenuModalOpen(true); };
  const handleAddSubmenu = (item) => { setSelectedMenu(null); setDefaultParent(item.id); setMenuModalOpen(true); };
  const handleDelete     = (id)   => { if (confirm("Delete this menu item? Submenu items will also be removed.")) deleteMutation.mutate(id); };

  // Inject defaultParent into modal when adding submenu
  const menuModalData = selectedMenu
    ? selectedMenu
    : defaultParent
    ? { parent: defaultParent, label: "", link: "", order: 0, is_active: true }
    : null;

  return (
    <>
      <HeaderModal
        key={`header-${headerData?.id ?? "new"}-${headerModalOpen}`}
        isOpen={headerModalOpen}
        onClose={() => setHeaderModalOpen(false)}
        data={headerData}
      />
      <MenuModal
        key={`menu-${selectedMenu?.id ?? defaultParent ?? "new"}-${menuModalOpen}-${selectedMenu?.label ?? ""}`}
        isOpen={menuModalOpen}
        onClose={() => { setMenuModalOpen(false); setSelectedMenu(null); setDefaultParent(null); }}
        data={menuModalData}
        parentOptions={parentOptions}
      />

      <div className="flex flex-col gap-8">

        {/* ── Header Info ── */}
        <div className="bg-white dark:bg-boxdark rounded-lg shadow-sm p-6 border border-stroke dark:border-strokedark">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Header</h2>
            <button onClick={() => setHeaderModalOpen(true)}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90 transition">
              <FiEdit /> {headerData ? "Edit" : "Setup"}
            </button>
          </div>

          {loadingHeader ? (
            <p className="text-gray-400 text-sm">Loading...</p>
          ) : !headerData ? (
            <p className="text-gray-400 text-sm">No header data yet. Click Setup to get started.</p>
          ) : headerData.logo ? (
            <img src={headerData.logo} alt="Logo" className="h-12 object-contain" />
          ) : (
            <p className="text-gray-400 text-sm">No logo uploaded yet.</p>
          )}
        </div>

        {/* ── Menu Items ── */}
        <div className="bg-white dark:bg-boxdark rounded-lg shadow-sm p-6 border border-stroke dark:border-strokedark">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold">Navigation Menu</h2>
              {menuItems.length > 0 && (
                <p className="text-sm text-gray-400 mt-0.5">{menuTree.length} top-level item{menuTree.length !== 1 ? "s" : ""} — click <FiPlus className="inline" size={12} /> on any item to add a submenu</p>
              )}
            </div>
            <button onClick={handleAdd}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90 transition">
              <FiPlus /> Add Item
            </button>
          </div>

          {loadingMenu ? (
            <p className="text-gray-400 text-sm">Loading...</p>
          ) : menuTree.length === 0 ? (
            <p className="text-gray-400 text-sm">No menu items yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {menuTree.map((item) => (
                <MenuTreeItem
                  key={item.id}
                  item={item}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onAddSubmenu={handleAddSubmenu}
                  deleting={deleteMutation.isPending && deleteMutation.variables === item.id}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </>
  );
};

export default HeaderForm;
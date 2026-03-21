"use client";
import React, { useState } from "react";
import axios from "axios";
import { baseURL, authToken } from "@/auth/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { FiRefreshCw } from "react-icons/fi";

// ---------- API ----------
const authHeaders = { Authorization: `Bearer ${authToken}` };

const fetchTheme  = () => axios.get(`${baseURL}/theme/`).then(r => r.data);
const updateTheme = (data) => axios.patch(`${baseURL}/theme/update/`, data, { headers: authHeaders });
const resetTheme  = () => axios.post(`${baseURL}/theme/reset/`, {}, { headers: authHeaders });

// ---------- DEFAULT VALUES ----------
const DEFAULTS = {
  color_primary:   "#004539",
  color_secondary: "#ffffff",
  color_accent:    "#d5ad67",
  color_neutral:   "#f8f6f2",
  color_text:      "#14181f",
  color_muted:     "#14181fcc",
  color_button_bg: "#0045391a",
  color_video_bg:  "#0000000f",
};

// Color fields config
const COLOR_FIELDS = [
  { key: "color_primary",   label: "Primary",    description: "Main brand color"              },
  { key: "color_secondary", label: "Secondary",   description: "Background / contrast color"  },
  { key: "color_accent",    label: "Accent",      description: "Highlights and CTAs"          },
  { key: "color_neutral",   label: "Neutral",     description: "Section backgrounds"          },
  { key: "color_text",      label: "Text",        description: "Main body text"               },
  { key: "color_muted",     label: "Muted Text",  description: "Secondary text"               },
  { key: "color_button_bg", label: "Button BG",   description: "Transparent button background"},
  { key: "color_video_bg",  label: "Video Overlay", description: "Video section overlay"     },
];

// ---------- COLOR SWATCH INPUT ----------
// Native color picker + hex text input combined
const ColorInput = ({ label, description, value, onChange, defaultValue }) => {
  const [hex, setHex] = useState(value);
  const isChanged = value !== defaultValue;

  // Sync local hex when parent value changes
  React.useEffect(() => { setHex(value); }, [value]);

  // Handle text input — only call onChange for valid hex
  const handleTextChange = (e) => {
    const v = e.target.value;
    setHex(v);
    if (/^#([0-9a-fA-F]{3,8})$/.test(v)) onChange(v);
  };

  // Native color picker only supports 6-char hex — strip alpha for picker
  const pickerValue = value.length === 9 ? value.slice(0, 7)
                    : value.length === 5 ? `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`
                    : value.length >= 7  ? value.slice(0, 7)
                    : "#000000";

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-strokedark bg-white dark:bg-boxdark hover:shadow-sm transition-shadow">
      {/* Color preview + picker */}
      <div className="relative shrink-0">
        <div
          className="w-12 h-12 rounded-lg border border-gray-300 dark:border-strokedark shadow-sm cursor-pointer overflow-hidden"
          style={{ backgroundColor: value }}
        >
          <input
            type="color"
            value={pickerValue}
            onChange={(e) => { setHex(e.target.value); onChange(e.target.value); }}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
            title={`Pick ${label} color`}
          />
        </div>
        {isChanged && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-white" title="Modified" />
        )}
      </div>

      {/* Label + hex input */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 dark:text-white">{label}</p>
        <p className="text-xs text-gray-400 mb-2">{description}</p>
        <input
          type="text"
          value={hex}
          onChange={handleTextChange}
          maxLength={9}
          placeholder="#000000"
          className="border border-gray-300 dark:border-strokedark rounded-md px-2 py-1 text-xs font-mono w-32
            focus:outline-none focus:ring-2 focus:ring-primary dark:bg-meta-4 transition"
        />
      </div>

      {/* Reset single color */}
      {isChanged && (
        <button
          onClick={() => { setHex(defaultValue); onChange(defaultValue); }}
          className="text-xs text-gray-400 hover:text-primary transition shrink-0"
          title={`Reset to ${defaultValue}`}
        >
          ↩ {defaultValue}
        </button>
      )}
    </div>
  );
};



// ---------- MAIN COMPONENT ----------
const ThemeForm = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(DEFAULTS);
  const [isDirty, setIsDirty] = useState(false);

  const { isLoading } = useQuery({
    queryKey: ["theme"],
    queryFn:  fetchTheme,
    onSuccess: (data) => {
      const picked = Object.fromEntries(COLOR_FIELDS.map(({ key }) => [key, data[key] || DEFAULTS[key]]));
      setForm(picked);
      setIsDirty(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateTheme,
    onSuccess: () => {
      queryClient.invalidateQueries(["theme"]);
      toast.success("Theme saved!");
      setIsDirty(false);
    },
    onError: () => toast.error("Failed to save theme."),
  });

  const resetMutation = useMutation({
    mutationFn: resetTheme,
    onSuccess: (res) => {
      const picked = Object.fromEntries(COLOR_FIELDS.map(({ key }) => [key, res.data[key] || DEFAULTS[key]]));
      setForm(picked);
      queryClient.invalidateQueries(["theme"]);
      toast.success("Theme reset to defaults!");
      setIsDirty(false);
    },
    onError: () => toast.error("Failed to reset theme."),
  });

  const setColor = (key) => (value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setIsDirty(true);
  };

  const handleSave = () => updateMutation.mutate(form);
  const handleReset = () => { if (confirm("Reset all colors to default?")) resetMutation.mutate(); };

  if (isLoading) return <p className="text-gray-400 text-sm">Loading theme...</p>;

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="bg-white dark:bg-boxdark rounded-lg shadow-sm p-6 border border-stroke dark:border-strokedark">
        <div className="flex flex-wrap justify-between items-start gap-4 mb-2">
          <div>
            <h2 className="text-xl font-semibold">Theme Colors</h2>
            
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              disabled={resetMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 transition text-sm disabled:opacity-60"
            >
              <FiRefreshCw size={14} className={resetMutation.isPending ? "animate-spin" : ""} />
              Reset to Default
            </button>
            <button
              onClick={handleSave}
              disabled={updateMutation.isPending || !isDirty}
              className="flex items-center gap-2 px-4 py-2 rounded bg-primary text-white hover:bg-opacity-90 transition text-sm disabled:opacity-60"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {isDirty && (
          <div className="mt-3 text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 px-3 py-2 rounded-md border border-amber-200 dark:border-amber-800">
            ⚠ You have unsaved changes
          </div>
        )}
      </div>

      {/* Two column: pickers + preview */}
      

        {/* Color pickers */}
        <div className="bg-white dark:bg-boxdark rounded-lg shadow-sm p-6 border border-stroke dark:border-strokedark">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Color Variables</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {COLOR_FIELDS.map(({ key, label, description }) => (
              <ColorInput
                key={key}
                label={label}
                description={description}
                value={form[key]}
                defaultValue={DEFAULTS[key]}
                onChange={setColor(key)}
              />
            ))}
          </div>
        </div>

        {/* Live preview — sticky on desktop */}
        <div className="lg:sticky lg:top-6 lg:self-start flex flex-col gap-4">

          
        </div>

      </div>
    
  );
};

export default ThemeForm;
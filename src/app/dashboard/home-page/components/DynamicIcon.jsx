import * as icons from "lucide-react";

export default function DynamicIcon({ name, size = 24, className, color, strokeWidth }) {
  if (!name) return null;

  // Convert kebab-case to PascalCase: "map-pin" → "MapPin"
  const pascalName = name
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");

  const Icon = icons[pascalName] || icons[name];

  if (!Icon) return null;

  return <Icon size={size} className={className} color={color} strokeWidth={strokeWidth} />;
}
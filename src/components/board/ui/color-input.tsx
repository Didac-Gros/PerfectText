import { useState } from "react";
import { Check } from "lucide-react";

interface ColorInputProps {
  onChange?: (color: string) => void;
  defaultValue?: string;
  swatches?: string[];
  label?: string;
}

const defaultSwatches = [
  "#ef4444", // Red
  "#f97316", // Orange
  "#84cc16", // Green
  "#06b6d4", // Cyan
  "#3b82f6", // Blue
  "#8b5cf6", // Purple
  "#d946ef", // Pink
  "#64748b", // Gray
];

export function ColorInput({
  onChange,
  defaultValue = "#3b82f6",
  swatches = defaultSwatches,
  label,
}: ColorInputProps) {
  const [selectedColor, setSelectedColor] = useState(defaultValue);

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    onChange?.(color);
  };

  return (
    <div className="w-[200px] bg-white dark:bg-gray-800 rounded-lg p-3 shadow-xl">
      {label && (
        <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-3">
          {label}
        </div>
      )}
      <div className="grid grid-cols-4 gap-2">
        {swatches.map((color) => (
          <button
            key={color}
            onClick={() => handleColorSelect(color)}
            className="w-8 h-8 rounded-full transition-all duration-200 hover:scale-110 
                     relative group overflow-hidden
                     ring-2 ring-white dark:ring-gray-900 shadow-md
                     hover:ring-2 hover:ring-offset-2 hover:ring-offset-white 
                     dark:hover:ring-offset-gray-800"
            style={{ backgroundColor: color }}
          >
            {selectedColor === color && (
              <div className="absolute inset-0 flex items-center justify-center 
                           bg-black/20 transition-opacity group-hover:bg-black/30">
                <Check className="w-4 h-4 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
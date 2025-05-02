import React from "react";
import { createPortal } from "react-dom";
import { X, Check, Image as ImageIcon, Palette } from "lucide-react";
import type { Board } from "../../types/global";

interface BackgroundPickerProps {
  onClose: () => void;
  onSelect: (background: Board["background"]) => void;
  currentBackground?: Board["background"];
}

const defaultBackgrounds = [
  {
    type: "image" as const,
    value:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop",
  },
  {
    type: "image" as const,
    value:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop",
  },
  {
    type: "image" as const,
    value:
      "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070&auto=format&fit=crop",
  },
  {
    type: "image" as const,
    value:
      "https://images.unsplash.com/photo-1682686580391-615b1f28e5ee?q=80&w=2070&auto=format&fit=crop",
  },
  {
    type: "image" as const,
    value:
      "https://images.unsplash.com/photo-1682686580186-b55d2a91053c?q=80&w=2075&auto=format&fit=crop",
  },
  {
    type: "gradient" as const,
    value: "bg-gradient-to-r from-rose-400 via-fuchsia-500 to-indigo-500",
  },
  {
    type: "gradient" as const,
    value: "bg-gradient-to-r from-emerald-500 to-emerald-900",
  },
  {
    type: "gradient" as const,
    value: "bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900",
  },
  {
    type: "gradient" as const,
    value: "bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600",
  },
];

export function BackgroundPicker({
  onClose,
  onSelect,
  currentBackground,
}: BackgroundPickerProps) {
  const [activeTab, setActiveTab] = React.useState<"photos" | "colors">(
    "photos"
  );
  const dialogRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dialogRef.current &&
        !dialogRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const isCurrentBackground = (background: Board["background"]) => {
    if (!currentBackground || !background) return false;
    return (
      currentBackground.type === background.type &&
      currentBackground.value === background.value
    );
  };

  const dialog = (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />

      <div className="flex items-start justify-center p-4">
        <div
          ref={dialogRef}
          className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-xl
                   border border-gray-200 dark:border-gray-700 mt-20"
        >
          <div
            className="flex items-center justify-between px-4 py-3 border-b 
                       border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Cambiar fondo
            </h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg
                     transition-colors duration-200"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <div className="p-4">
            <div className="flex space-x-4 mb-4">
              <button
                onClick={() => setActiveTab("photos")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg
                         transition-colors duration-200 ${
                           activeTab === "photos"
                             ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400"
                             : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                         }`}
              >
                <ImageIcon className="w-5 h-5" />
                <span>Fotos</span>
              </button>
              <button
                onClick={() => setActiveTab("colors")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg
                         transition-colors duration-200 ${
                           activeTab === "colors"
                             ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400"
                             : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                         }`}
              >
                <Palette className="w-5 h-5" />
                <span>Colores</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {activeTab === "photos" && (
                <label
                  className="relative group aspect-video rounded-lg border-2 border-dashed border-gray-300
               flex items-center justify-center cursor-pointer hover:border-primary-500 transition"
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const localUrl = URL.createObjectURL(file);
                        onSelect({ type: "image", value: localUrl });
                      }
                    }}
                    className="hidden"
                  />
                  <span className="text-sm text-gray-500 group-hover:text-primary-500">
                    Elegir desde tu PC
                  </span>
                </label>
              )}
              {defaultBackgrounds
                .filter((bg) =>
                  activeTab === "photos"
                    ? bg.type === "image"
                    : bg.type === "gradient"
                )
                .map((background, index) => (
                  <button
                    key={index}
                    onClick={() => onSelect(background)}
                    className="relative group aspect-video rounded-lg overflow-hidden
                           transition-transform duration-200 hover:scale-[1.02]"
                  >
                    {background.type === "image" ? (
                      <img
                        src={background.value}
                        alt="Background option"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={`w-full h-full ${background.value}`} />
                    )}

                    {isCurrentBackground(background) && (
                      <div
                        className="absolute inset-0 bg-black/40 flex items-center 
                                  justify-center"
                      >
                        <Check className="w-6 h-6 text-white" />
                      </div>
                    )}

                    <div
                      className="absolute inset-0 bg-black/40 opacity-0 
                                group-hover:opacity-100 transition-opacity duration-200"
                    />
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
}

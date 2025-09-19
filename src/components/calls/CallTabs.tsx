import { Shuffle } from "lucide-react";

interface CallTabsProps {
  activeTab: "recent" | "random";
  setActiveTab: (tab: "recent" | "random") => void;
}

export function CallTabs({ activeTab, setActiveTab }: CallTabsProps) {
  return (
    <div className="flex justify-center">
      <div className="flex justify-center mb-8 space-x-1 bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setActiveTab("recent")}
          className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
            activeTab === "recent"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Llamadas Recientes
        </button>
        <button
          onClick={() => setActiveTab("random")}
          className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 flex items-center space-x-2 ${
            activeTab === "random"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Shuffle className="w-4 h-4" />
          <span>Random Calls</span>
        </button>
      </div>
    </div>
  );
}

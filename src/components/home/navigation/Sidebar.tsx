import {
  Layout,
  Users,
  Calendar,
  Settings,
  Home,
  Phone,
  Bell,
} from "lucide-react";
import { useBoardStore } from "../../../hooks/useBoardStore";
import { SidebarType } from "../../../types/global";

interface SidebarProps {
  isOpen: boolean;
  currentView: SidebarType;
  onViewChange: (view: SidebarType) => void;
  numNotifications: number;
}

export function Sidebar({
  isOpen,
  currentView,
  onViewChange,
  numNotifications,
}: SidebarProps) {
  const { setCurrentBoard } = useBoardStore();

  const menuItems = [
    {
      icon: Home,
      text: "MySpace",
      action: () => onViewChange("myspace"),
      highlight: currentView === "myspace",
    },
    {
      icon: Layout,
      text: "Nexus",
      action: () => {
        setCurrentBoard("");
        onViewChange("boards");
      },
      highlight: currentView === "boards",
    },
    {
      icon: Calendar,
      text: "Calendar",
      action: () => onViewChange("calendar"),
      highlight: currentView === "calendar",
    },
    {
      icon: Users,
      text: "Campus",
      action: () => {
        setCurrentBoard("");
        onViewChange("campus");
      },
      highlight: currentView === "campus",
    },
    {
      icon: Phone,
      text: "Calls",
      action: () => {
        setCurrentBoard("");
        onViewChange("calls");
      },
      highlight: currentView === "calls",
    },
  ];

  const menuDownItems = [
    {
      icon: Bell,
      text: "Notifications",
      action: () => {
        setCurrentBoard("");
        onViewChange("notifications");
      },
      highlight: currentView === "notifications",
    },
    {
      icon: Settings,
      text: "Perfil",
      action: () => {
        setCurrentBoard("");
        onViewChange("profile");
      },
      highlight: currentView === "profile",
    },
  ];

  return (
    <aside
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 
                border-r border-gray-200 dark:border-gray-700 transition-all duration-300 
                ${isOpen ? "w-64 animate-slide-in" : "w-0"} overflow-hidden z-50`}
    >
      <div className="p-4 flex flex-col justify-between h-full">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.text}
              onClick={item.action}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg 
                      transition-colors duration-200 ${
                        item.highlight
                          ? "bg-[#f0f9ff] text-[#0284c7] dark:bg-[#0c4a6e]/20 dark:text-[#38bdf8]"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
            >
              <item.icon
                className={`size-5 ${item.highlight ? "text-[#0ea5e9]" : ""}`}
              />
              <span className="text-sm font-medium">{item.text}</span>
            </button>
          ))}
        </div>
        <div className="space-y-1">
          <button
            onClick={() => {
              setCurrentBoard("");
              onViewChange("notifications");
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg 
                      transition-colors duration-200 ${
                        currentView === "notifications"
                          ? "bg-[#f0f9ff] text-[#0284c7] dark:bg-[#0c4a6e]/20 dark:text-[#38bdf8]"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
          >
            <Bell
              className={`size-5 ${currentView === "notifications" ? "text-[#0ea5e9]" : ""}`}
            />
            <span className="text-sm font-medium">{"Notifications"}</span>
            {numNotifications > 0 && (
              <div className="relative bottom-1 right-2 size-4 bg-blue-500 text-white text-xs font-semibold rounded-full flex items-center justify-center shadow-sm">
                {numNotifications}
              </div>
            )}
          </button>
          <button
            onClick={() => {
              setCurrentBoard("");
              onViewChange("profile");
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg 
                      transition-colors duration-200 ${
                        currentView === "profile"
                          ? "bg-[#f0f9ff] text-[#0284c7] dark:bg-[#0c4a6e]/20 dark:text-[#38bdf8]"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
          >
            <Settings
              className={`size-5 ${currentView === "profile" ? "text-[#0ea5e9]" : ""}`}
            />
            <span className="text-sm font-medium">{"Perfil"}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

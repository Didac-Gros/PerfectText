import { Layout, Users, Calendar, Settings, Home } from 'lucide-react';
import { useBoardStore } from '../../../hooks/useBoardStore';
import { SidebarType } from '../../../types/global';

interface SidebarProps {
  isOpen: boolean;
  currentView: SidebarType;
  onViewChange: (view: SidebarType) => void;
}

export function Sidebar({ isOpen, currentView, onViewChange }: SidebarProps) {
  const { setCurrentBoard } = useBoardStore();
  const menuItems = [
    { 
      icon: Home,
      text: 'MySpace',
      action: () => onViewChange('myspace'),
      highlight: currentView === 'myspace'
    },
    { 
      icon: Layout, 
      text: 'Nexus', 
      action: () => {
        setCurrentBoard('');
        onViewChange('boards');
      }, 
      highlight: currentView === 'boards'
    },
    { 
      icon: Calendar, 
      text: 'Calendar', 
      action: () => onViewChange('calendar'),
      highlight: currentView === 'calendar'
    },
    { icon: Users, text: 'Grupos', href: '#' },
  ];

  return (
    <aside
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 
                border-r border-gray-200 dark:border-gray-700 transition-all duration-300 
                ${isOpen ? 'w-64 animate-slide-in' : 'w-0'} overflow-hidden`}
    >
      <div className="p-4 flex flex-col h-full">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.text}
              onClick={item.action}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg 
                      transition-colors duration-200 ${
                item.highlight 
                  ? 'bg-[#f0f9ff] text-[#0284c7] dark:bg-[#0c4a6e]/20 dark:text-[#38bdf8]' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <item.icon className={`w-5 h-5 ${item.highlight ? 'text-[#0ea5e9]' : ''}`} />
              <span className="font-medium">{item.text}</span>
            </button>
          ))}
        </div>

        <div className="mt-auto">
          <button
            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 
                     dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 
                     rounded-lg transition-colors duration-200"
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Configuración</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
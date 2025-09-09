import React from "react";

interface FilterTabsProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export const FilterTabs: React.FC<FilterTabsProps> = ({
  activeFilter,
  onFilterChange,
}) => {
  const filters = [
    { id: "all", label: "Feed" },
    { id: "my-feels", label: "Mis feels" },
  ];

  return (
    <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-150 ${
            activeFilter === filter.id
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};

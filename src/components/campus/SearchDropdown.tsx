import React, { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Avatar } from "../shared/Avatar";
import { User } from "../../types/global";

interface SearchDropdownProps {
  allUsers: User[];
  onUserSelect?: (user: User) => void;
}

export const SearchDropdown: React.FC<SearchDropdownProps> = ({
  allUsers,
  onUserSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter users based on search query
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();

    if (q) {
      const filtered = (allUsers ?? []).filter((u) =>
        (u?.name ?? "").toLowerCase().includes(q)
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers([]);
    }
  }, [searchQuery, allUsers]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setIsOpen(value.length > 0);
  };

  const handleUserSelect = (user: User) => {
    setSearchQuery("");
    setIsOpen(false);
    onUserSelect?.(user);
    inputRef.current?.blur();
  };

  const clearSearch = () => {
    setSearchQuery("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={searchRef} className="relative mb-8">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Buscar personas..."
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => searchQuery && setIsOpen(true)}
          className="w-full pl-11 pr-10 py-3 bg-gray-50/50 border border-gray-100 rounded-xl text-sm placeholder-gray-400 focus:bg-white focus:border-gray-200 focus:outline-none transition-all duration-200 hover:bg-gray-50"
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-150"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100/80 z-50 max-h-72 overflow-y-auto backdrop-blur-sm">
          {filteredUsers.length > 0 ? (
            <div className="py-3">
              {filteredUsers.map((user) => (
                <button
                  key={user.uid}
                  onClick={() => handleUserSelect(user)}
                  className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50/80 transition-all duration-150 text-left group"
                >
                  <Avatar
                    src={user.profileImage ?? "/default_avatar.jpg"}
                    alt={user.name ?? "Usuario"}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate group-hover:text-gray-800">
                      {user.name ?? "Sin nombre"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : searchQuery ? (
            <div className="py-6 px-4 text-center text-sm text-gray-500">
              No se encontraron usuarios
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

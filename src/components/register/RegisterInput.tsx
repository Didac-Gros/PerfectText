import React, { useState } from "react";
import { FaRegEyeSlash } from "react-icons/fa6";

interface RegisterInputProps {
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
  password?: boolean;
}

export const RegisterInput: React.FC<RegisterInputProps> = ({
  type,
  placeholder,
  value,
  onChange,
  icon,
  password
}) => {
  const [visibility, setVisibility] = useState<boolean>(false);

  return (
    <div className="mb-4 relative">
      <input
        type={!visibility ? type : "text"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
      {icon && (
        <button
          type="button"
          className="absolute right-4 top-2.5 text-gray-500 hover:text-gray-700"
          onClick={() => setVisibility(!visibility)}
        >
          {password ? (visibility ? icon : <FaRegEyeSlash className="w-5 h-5" />) : icon}
        </button>
      )}
    </div>
  );
};

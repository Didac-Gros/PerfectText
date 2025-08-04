import React from "react";

interface AvatarProps {
  src?: string;
  alt: string;
  size?: "sm" | "md" | "lg";
  status?: "online" | "busy" | "away" | "offline" | "available" | "silent";
  initials?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = "md",
  status,
  initials,
}) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };

  const statusColors = {
    online: "bg-green-400",
    busy: "bg-red-400",
    away: "bg-yellow-400",
    offline: "bg-gray-300",
    available: "bg-blue-400",
    silent: "bg-gray-500",
  };

  return (
    <div className="relative inline-block">
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-100 flex items-center justify-center font-medium text-gray-600`}
      >
        {src ? (
          <img src={src} alt={alt} className="w-full h-full object-cover" />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      {status && (
        <div
          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${statusColors[status]}`}
        />
      )}
    </div>
  );
};

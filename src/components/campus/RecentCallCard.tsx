import { Phone } from "lucide-react";
import { Call, User } from "../../types/global";
import { formatDuration, getRelativeTime } from "../../utils/utils";
import { Avatar } from "../shared/Avatar";
import { useAuth } from "../../hooks/useAuth";

interface RecentCallCardProps {
  call: Call;
  i: number;
  userRecentCalls: User[];
  setShowCallModal: (show: boolean) => void;
  setSelectedUser: (user: User) => void;
}

export function RecentCallCard({
  call,
  i,
  userRecentCalls,
  setShowCallModal,
  setSelectedUser,
}: RecentCallCardProps) {
  const { userStore } = useAuth();
  return (
    <div
      key={call.id}
      className="bg-white/60 backdrop-blur-xl rounded-xl p-4 border border-gray-100/50 shadow-sm hover:shadow-md hover:bg-white/80 transition-all duration-300 group"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Avatar
              src={userRecentCalls[i]?.profileImage ?? "/default_avatar.jpg"}
              alt={userRecentCalls[i]?.name}
              size="sm"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white bg-green-400 shadow-sm" />
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-sm font-semibold text-gray-900">
                {userRecentCalls[i]?.name}
              </h3>
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-600">
              <span className="flex items-center">
                <span
                  className={
                    userStore?.uid === call.callerUser
                      ? "text-blue-600"
                      : "text-green-600"
                  }
                >
                  {userStore?.uid === call.callerUser ? "↗️" : "↙️"}
                </span>
              </span>
              <span>{getRelativeTime(call.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <p className="text-sm font-semibold text-gray-900 mr-2">
            {formatDuration(call.duration)}
          </p>
          <button
            onClick={() => {
              setSelectedUser(userRecentCalls[i]);
              setShowCallModal(true);
            }}
            className="opacity-0 group-hover:opacity-100 p-2 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 transition-all duration-200 hover:scale-110"
          >
            <Phone className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

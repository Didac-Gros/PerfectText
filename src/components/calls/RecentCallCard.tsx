import { Phone, Trash2 } from "lucide-react";
import { formatDuration, getRelativeTime } from "../../utils/utils";
import { Avatar } from "../shared/Avatar";
import { Call, User } from "../../types/global";
import { useAuth } from "../../hooks/useAuth";

interface RecentCallCardProps {
  call: Call;
  i: number;
  userRecentCalls: User[];
  handleCallUser: (user: User) => void;
  handleDeleteCall: (callId: string) => void;
}

export function RecentCallCard({
  call,
  i,
  userRecentCalls,
  handleCallUser,
  handleDeleteCall,
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
            <div className="flex items-center space-x-3 text-xs text-gray-600">
              <span>
                {userRecentCalls[i]?.studies?.year}º curso •{" "}
                {userRecentCalls[i]?.studies?.career}
              </span>
              <span className="text-gray-400">•</span>
              <span className="flex items-center space-x-1">
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
              <span className="text-gray-400">•</span>
              <span>{getRelativeTime(call.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">
              {formatDuration(call.duration)}
            </p>
            <p className="text-xs text-gray-500">duración</p>
          </div>
          <button
            onClick={() => handleCallUser(userRecentCalls[i])}
            className="opacity-0 group-hover:opacity-100 p-2 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 transition-all duration-200 hover:scale-110"
          >
            <Phone className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteCall(call.id)}
            className="opacity-0 group-hover:opacity-100 p-2 rounded-full bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 transition-all duration-200 hover:scale-110"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

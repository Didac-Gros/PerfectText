import { CallState } from "../../../hooks/useVoiceCall";
import { Studies } from "../../../types/global";
import { formatDuration } from "../../../utils/utils";

interface InRandomCallUIProps {
  isTransitioning: boolean;
  profileImage: string;
  name: string;
  studies: Studies | undefined;
  callDuration: number;
  state: CallState;
}

export function InRandomCallUI({
  isTransitioning,
  profileImage,
  name,
  studies,
  callDuration,
  state,
}: InRandomCallUIProps) {
  return (
    <div
      className={`text-center pt-12 transition-all duration-500 ${
        isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"
      }`}
    >
      <div className="relative">
        <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-gray-200 shadow-lg">
          <img
            src={profileImage || "/default_avatar.jpg"}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
        {/* Online Indicator */}
        <div className="absolute bottom-0 right-1/2 transform translate-x-1/2 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-gray-900">{name}</h3>
        <div className="flex items-center justify-center space-x-2 text-gray-600 text-sm">
          {studies && (
            <div>
              <span>{studies?.year}º Curso</span>
              <span className="p-1"> • </span>
              <span>{studies?.career}</span>
            </div>
          )}
        </div>
      </div>
      {state === "talking" ? (
        <div className="flex items-center justify-center space-x-1 text-green-600 mt-10">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          <span className="font-mono text-sm">
            {formatDuration(callDuration)}
          </span>
        </div>
      ) : (
        <h1 className="text-gray-600 text-lg font-medium flex items-center justify-center gap-2 mt-10">
          <span className="relative flex size-3 ">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full size-3 bg-green-500"></span>
          </span>
          Esperando respuesta...
        </h1>
      )}
      {/* Connection Timer */}
    </div>
  );
}

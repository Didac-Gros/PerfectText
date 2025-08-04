import { useState } from "react";
import { Calls } from "./CallsSection";

export function CallsTab() {
  const [activeCall, setActiveCall] = useState<{
    participants: any[];
    initiator: any;
    startTime: Date;
  } | null>(null);
  const currentUser = {
    id: "current",
    name: "María García",
    initials: "MG",
    year: "3º Curso",
    major: "Psicología",
    avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=maria&size=64",
  };

  const [recentCalls, setRecentCalls] = useState([
    {
      id: "1",
      user: {
        id: "1",
        name: "Ana Martín",
        initials: "AM",
        avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=ana&size=64",
        mood: {
          emoji: "😴",
          name: "Aburrido/a",
          color: "bg-blue-50 text-blue-600 border-blue-100",
        },
        status: "available" as const,
        year: "2º Curso",
        major: "Ingeniería",
      },
      duration: "3:24",
      timestamp: "hace 2h",
      type: "outgoing" as const,
    },
    {
      id: "2",
      user: {
        id: "3",
        name: "Laura Sánchez",
        initials: "LS",
        mood: {
          emoji: "👀",
          name: "Atento/a pero...",
          color: "bg-yellow-50 text-yellow-600 border-yellow-100",
        },
        status: "available" as const,
        year: "1º Curso",
        major: "Filosofía",
      },
      duration: "1:45",
      timestamp: "ayer",
      type: "incoming" as const,
    },
    {
      id: "3",
      user: {
        id: "5",
        name: "Sofía Herrera",
        initials: "SH",
        avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=sofia&size=64",
        mood: {
          emoji: "😌",
          name: "Tranquilo/a",
          color: "bg-green-50 text-green-600 border-green-100",
        },
        status: "silent" as const,
        year: "2º Curso",
        major: "Arte",
      },
      duration: "7:12",
      timestamp: "hace 3 días",
      type: "outgoing" as const,
    },
  ]);

  return (
    <div className=" bg-gray-50 dark:bg-[#161616] p-6">
      <div className="max-w-[1400px] mx-auto space-y-8">
        <Calls
          currentUser={currentUser}
          recentCalls={recentCalls}
          onCallStart={setActiveCall}
        />
      </div>
    </div>
  );
}

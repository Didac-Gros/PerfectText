import { useState, useEffect, useRef } from "react";
import { Calls } from "./CallsSection";
import { CallState } from "../../hooks/useVoiceCall";

interface CallsTabProps {
  state: CallState;
  sendCall: (toUserId: string) => Promise<void>;
  hangup: () => void;
  callDuration: number; // Duración de la llamada en segundos
}

export function CallsTab({ state, sendCall, hangup, callDuration }: CallsTabProps) {
  const [activeCall, setActiveCall] = useState<{
    participants: any[];
    initiator: any;
    startTime: Date;
  } | null>(null);
  const volume = 0.4;
  const loop = true;
  const startMuted = true;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const el = new Audio("/music/llamada.mp3");
    el.loop = loop;
    el.volume = volume;
    el.muted = true; // 🔇 arranca siempre en silencio
    audioRef.current = el;

    // Intentar reproducir en mute (esto sí lo dejan los navegadores)
    el.play().catch(() => {});

    return () => {
      el.pause();
      el.src = "";
      audioRef.current = null;
    };
  }, ["/music/llamada.mp3", loop, volume]);

  // Al cambiar enabled → actualizar mute
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.muted = !enabled;
    if (enabled) {
      audioRef.current.play().catch(() => {}); // reintentar si hace falta
    }
  }, [enabled]);

  // Escuchar el primer gesto del usuario y activar música si se desea
  useEffect(() => {
    const tryResume = () => {
      if (!audioRef.current) return;
      audioRef.current.play().catch(() => {});
    };
    window.addEventListener("pointerdown", tryResume, { once: true });
    window.addEventListener("keydown", tryResume, { once: true });
    return () => {
      window.removeEventListener("pointerdown", tryResume);
      window.removeEventListener("keydown", tryResume);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#161616] p-6">
      <div className="max-w-[1400px] mx-auto space-y-8">
        <Calls
          // recentCalls={recentCalls}
          onCallStart={setActiveCall}
          state={state}
          call={sendCall}
          hangup={hangup}
          startMusic={setEnabled}
          callDuration={callDuration}
        />
      </div>
    </div>
  );
}

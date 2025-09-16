// BackgroundAudio.tsx
import { useEffect, useRef, useState } from "react";

type Props = {
  src: string;          // mp3/ogg en /public o URL absoluta
  volume?: number;      // 0..1
  loop?: boolean;
  startMuted?: boolean; // arranca silenciado para evitar bloqueos
};

export default function BackgroundAudio({
  src,
  volume = 0.4,
  loop = true,
  startMuted = true,
}: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState<boolean>(() => {
    const saved = localStorage.getItem("bg-audio-muted");
    return saved !== null ? saved === "true" : startMuted;
  });

  // Crear el elemento <audio> una vez
  useEffect(() => {
    const el = new Audio(src);
    el.loop = loop;
    el.volume = volume;
    el.muted = muted;
    audioRef.current = el;

    // Autoplay silencioso (permitido) si está mute
    el.play().catch(() => {/* ignorar hasta interacción */});

    return () => {
      el.pause();
      el.src = "";
      audioRef.current = null;
    };
  }, [src, loop, volume]); // (muted se gestiona aparte)

  // Aplicar cambios de mute/volumen en caliente
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.muted = muted;
    audioRef.current.volume = volume;
    localStorage.setItem("bg-audio-muted", String(muted));
  }, [muted, volume]);

  // Reintentar play tras primer gesto del usuario (click/tecla/touch)
  useEffect(() => {
    const resume = () => {
      const el = audioRef.current;
      if (!el) return;
      el.play().catch(() => {/* p.ej. iOS requiere gesto con no-muted */});
    };
    window.addEventListener("pointerdown", resume, { once: true });
    window.addEventListener("keydown", resume, { once: true });
    return () => {
      window.removeEventListener("pointerdown", resume);
      window.removeEventListener("keydown", resume);
    };
  }, []);

  return (
    <button
      onClick={() => setMuted((m) => !m)}
      className="fixed bottom-4 right-4 rounded-full px-4 py-2 shadow bg-black/70 text-white text-sm"
      aria-label={muted ? "Activar música" : "Silenciar música"}
      title={muted ? "Activar música" : "Silenciar música"}
    >
      {muted ? "🔇 Música" : "🔊 Música"}
    </button>
  );
}

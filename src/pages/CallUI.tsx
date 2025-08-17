import React from "react";
import { useVoiceCall } from "../hooks/useVoiceCall";

interface CallUIProps {
  me: string;           // userId del usuario actual (debe coincidir con sub del JWT)
  jwt: string;          // token JWT emitido en el login
  targetUserId?: string; // opcional: solo necesario para iniciar llamada
}

export function CallUI({ me, jwt, targetUserId }: CallUIProps) {
  const {
    state,
    incomingFrom,
    muted,
    call,
    accept,
    reject,
    hangup,
    toggleMute,
    bindRemoteAudio
  } = useVoiceCall({ me, jwt });

  const canCall = !!targetUserId && (state === "idle" || state === "ended");
  const canHang = ["ringing-out", "talking", "connecting"].includes(state);

  return (
    <div style={{ padding: 16, border: "1px solid #ccc", borderRadius: 8, maxWidth: 420 }}>
      <h3>Llamada de voz</h3>
      <p>Yo: <b>{me}</b></p>
      <p>Estado: <b>{state}</b></p>

      {/* Botón de llamar solo si hay target */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <button onClick={() => targetUserId && call(targetUserId)} disabled={!canCall}>
          📞 {targetUserId ? `Llamar a ${targetUserId}` : "Llamar (elige un destinatario)"}
        </button>

        <button onClick={hangup} disabled={!canHang}>❌ Colgar</button>

        <button onClick={toggleMute} disabled={state === "idle" || state === "ended"}>
          {muted ? "🔊 Quitar silencio" : "🔇 Silenciar"}
        </button>
      </div>

      {/* Llamada entrante aparece sola cuando llega el 'ring' */}
      {state === "ringing-in" && (
        <div style={{ marginBottom: 12 }}>
          <p>📲 Llamada entrante de <b>{incomingFrom}</b></p>
          <button onClick={accept} style={{ marginRight: 8 }}>✅ Aceptar</button>
          <button onClick={reject}>❌ Rechazar</button>
        </div>
      )}

      {/* Audio remoto (invisible) */}
      <audio ref={bindRemoteAudio} autoPlay playsInline />

      <small style={{ display: "block", marginTop: 12, color: "#666" }}>
        El receptor solo necesita su <code>me</code> y <code>jwt</code> para estar “localizable”.
        El aviso de llamada se muestra automáticamente.
      </small>
    </div>
  );
}

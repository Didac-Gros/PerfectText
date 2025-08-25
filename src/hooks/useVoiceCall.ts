import { useEffect, useMemo, useRef, useState } from "react";
import { CallRole } from "../types/global";

type SigMsg =
  | { type: "ring"; callId: string; from: string; to: string }
  | { type: "accept"; callId: string; from: string; to: string }
  | {
      type: "offer";
      callId: string;
      from: string;
      to: string;
      sdp: RTCSessionDescriptionInit;
    }
  | {
      type: "answer";
      callId: string;
      from: string;
      to: string;
      sdp: RTCSessionDescriptionInit;
    }
  | {
      type: "candidate";
      callId: string;
      from: string;
      to: string;
      candidate: RTCIceCandidateInit;
    }
  | {
      type: "reject";
      callId: string;
      from: string;
      to: string;
      reason?: string;
    }
  | { type: "hangup"; callId: string; from: string; to: string };

export type CallState =
  | "idle"
  | "ringing-out"
  | "ringing-in"
  | "connecting"
  | "talking"
  | "ended";

const STUN: RTCIceServer[] = [{ urls: "stun:stun.l.google.com:19302" }];

export function useVoiceCall({
  me,
  jwt,
  wsBase = "ws://localhost:3000/ws",
}: {
  me: string; // userId actual
  jwt: string; // token JWT emitido por tu backend
  wsBase?: string;
}) {
  const [state, setState] = useState<CallState>("idle");
  const [peerId, setPeerId] = useState<string | null>(null);
  const [callId, setCallId] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [incomingFrom, setIncomingFrom] = useState<string | null>(null);

  // Rol de la llamada
  const [role, setRole] = useState<CallRole>(null);
  const isCaller = role === "caller";
  const isCallee = role === "callee";

  // Duración
  const [durationSeconds, setDurationSeconds] = useState(0);
  const callStartRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const peerIdRef = useRef<string | null>(null);

  useEffect(() => {
    peerIdRef.current = peerId;
  }, [peerId]);

  const base = import.meta.env.PROD
    ? "wss://perfecttext.onrender.com/ws"
    : "ws://localhost:3000/ws"; // <-- backend local

  const wsUrl = `${base}?token=${encodeURIComponent(jwt)}`;

  // ---- duración helpers
  const startTimer = () => {
    if (callStartRef.current != null) return;
    callStartRef.current = Date.now();
    setDurationSeconds(0);
    timerRef.current = window.setInterval(() => {
      if (callStartRef.current != null) {
        const secs = Math.floor((Date.now() - callStartRef.current) / 1000);
        setDurationSeconds(secs);
      }
    }, 1000);
  };
  const stopTimer = () => {
    if (timerRef.current != null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    callStartRef.current = null;
  };
  const resetDuration = () => {
    stopTimer();
    setDurationSeconds(0);
  };
  const durationLabel = (() => {
    const m = Math.floor(durationSeconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (durationSeconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  })();

  // ---- RTCPeerConnection
  const ensurePc = () => {
    if (pcRef.current) return pcRef.current;
    const pc = new RTCPeerConnection({ iceServers: STUN });

    pc.oniceconnectionstatechange = () => {
      console.log("ICE state:", pc.iceConnectionState);
    };

    pc.onconnectionstatechange = () => {
      const st = pc.connectionState;
      console.log("PC state:", st);
      if (st === "connected") {
        setState("talking");
        startTimer();
      }
      if (["failed", "disconnected", "closed"].includes(st)) {
        setState("ended");
        stopTimer();
      }
    };

    pc.onicecandidate = (ev) => {
      if (!ev.candidate) {
        return;
      }
      const to = peerIdRef.current;
      if (to) {
        wsSend({
          type: "candidate",
          callId,
          to,
          candidate: ev.candidate.toJSON(),
        });
      }
    };

    pc.ontrack = (ev) => {
      const [stream] = ev.streams;
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = stream;
        remoteAudioRef.current.muted = false;
        remoteAudioRef.current.volume = 1;
        remoteAudioRef.current
          .play()
          .catch((err) => console.warn("autoplay bloqueado:", err));
      }
    };

    pcRef.current = pc;
    return pc;
  };

  const wsSend = (obj: any) =>
    wsRef.current?.readyState === WebSocket.OPEN &&
    wsRef.current.send(JSON.stringify(obj));

  // ---- WebSocket
  useEffect(() => {
    const ws = new WebSocket(wsUrl);

    ws.onmessage = async (ev) => {
      const msg = JSON.parse(ev.data) as SigMsg;
      switch (msg.type) {
        case "ring":
          // Llamada entrante → soy callee
          setIncomingFrom(msg.from);
          setCallId(msg.callId);
          setPeerId(msg.from);
          setRole("callee");
          resetDuration();
          setState("ringing-in");
          break;

        case "offer": {
          // Refuerzo por si llega offer antes de marcar rol
          setRole((r) => r ?? "callee");
          setPeerId(msg.from);
          const pc = ensurePc();
          await pc.setRemoteDescription(msg.sdp);
          const stream = await getMic();
          stream.getTracks().forEach((t) => pc.addTrack(t, stream));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          wsSend({
            type: "answer",
            callId: msg.callId,
            to: msg.from,
            sdp: answer,
          });
          setState("connecting");
          break;
        }

        case "answer": {
          const pc = ensurePc();
          await pc.setRemoteDescription(msg.sdp);
          setState("connecting");
          break;
        }

        case "candidate": {
          const pc = ensurePc();
          try {
            await pc.addIceCandidate(msg.candidate);
          } catch (e) {
            console.error("✗ addIceCandidate error", e);
          }
          break;
        }

        case "accept": {
          // Yo inicié la llamada → soy caller
          setRole("caller");
          setPeerId(msg.from);
          if (!callId) setCallId(msg.callId);
          await createAndSendOffer(msg.from, msg.callId);
          setState("connecting");
          break;
        }

        case "reject":
          setState("ended");
          stopTimer();
          break;

        case "hangup":
          end();
          break;
      }
    };

    wsRef.current = ws;
    return () => {
      ws.close();
    };
  }, [wsUrl]); // eslint-disable-line

  // ---- Media
  const getMic = async () => {
    if (localStreamRef.current) return localStreamRef.current;
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: false,
    });
    localStreamRef.current = stream;
    return stream;
  };

  // ---- API pública
  const call = async (toUserId: string) => {
    setPeerId(toUserId);
    setRole("caller");
    setState("ringing-out");
    resetDuration();
    const id = crypto.randomUUID();
    setCallId(id);
    wsSend({ type: "ring", callId: id, to: toUserId });
  };

  const createAndSendOffer = async (to: string, callId: string) => {
    const pc = ensurePc();
    const stream = await getMic();
    stream.getTracks().forEach((t) => pc.addTrack(t, stream));
    const offer = await pc.createOffer({ offerToReceiveAudio: true });
    await pc.setLocalDescription(offer);
    wsSend({ type: "offer", callId, to, sdp: offer });
  };

  const accept = async () => {
    setRole((r) => r ?? "callee");
    setState("connecting");
    setIncomingFrom(null);
    resetDuration();
    if (peerId && callId) {
      wsSend({ type: "accept", callId, to: peerId });
    }
  };

  const reject = () => {
    if (peerId && callId) wsSend({ type: "reject", callId, to: peerId });
    end();
  };

  const hangup = () => {
    if (peerId && callId) wsSend({ type: "hangup", callId, to: peerId });
    end();
  };

  const end = () => {
    pcRef.current?.getSenders().forEach((s) => {
      try {
        s.track?.stop();
      } catch {}
    });
    pcRef.current?.close();
    pcRef.current = null;
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    setState("ended");
    stopTimer();
    setRole(null);
    setPeerId(null);
    setCallId(null);
  };

  const toggleMute = () => {
    setMuted((m) => {
      const next = !m;
      localStreamRef.current
        ?.getAudioTracks()
        .forEach((t) => (t.enabled = !next));
      return next;
    });
  };

  const bindRemoteAudio = (el: HTMLAudioElement | null) => {
    remoteAudioRef.current = el;
  };

  return {
    // estado básico
    state,
    incomingFrom,
    muted,

    // duración
    durationSeconds,
    durationLabel,

    // rol
    role,
    isCaller,
    isCallee,

    // acciones
    call,
    accept,
    reject,
    hangup,
    toggleMute,
    bindRemoteAudio,
  };
}

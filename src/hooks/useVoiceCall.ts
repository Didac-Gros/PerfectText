import { useEffect, useMemo, useRef, useState } from "react";

type SigMsg =
  | { type: "ring"; callId: string; from: string; to: string }
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
  | "in-call"
  | "ended";

const STUN: RTCIceServer[] = [{ urls: "stun:stun.l.google.com:19302" }];

export function useVoiceCall({
  me,
  jwt,
  wsBase = "ws://localhost:3001/ws", // cambia al de tu servidor
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

  const wsRef = useRef<WebSocket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

  const wsUrl = useMemo(
    () => `${wsBase}?token=${encodeURIComponent(jwt)}`,
    [wsBase, jwt]
  );

  console.log("Conectando a WS:", wsUrl);

  const ensurePc = () => {
    if (pcRef.current) return pcRef.current;
    const pc = new RTCPeerConnection({ iceServers: STUN });

    pc.onicecandidate = (ev) => {
      if (ev.candidate && callId && peerId) {
        wsSend({
          type: "candidate",
          callId,
          to: peerId,
          candidate: ev.candidate.toJSON(),
        });
      }
    };
    pc.ontrack = (ev) => {
      const [stream] = ev.streams;
      if (remoteAudioRef.current) remoteAudioRef.current.srcObject = stream;
    };
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") setState("in-call");
      if (["failed", "disconnected", "closed"].includes(pc.connectionState)) {
        setState("ended");
      }
    };
    pcRef.current = pc;
    return pc;
  };

  const wsSend = (obj: any) =>
    wsRef.current?.readyState === WebSocket.OPEN &&
    wsRef.current.send(JSON.stringify(obj));

  // Conexión WebSocket
  useEffect(() => {
    console.log("Conectando a WebSocket:", wsUrl);
    const ws = new WebSocket(wsUrl);
    ws.onmessage = async (ev) => {
      const msg = JSON.parse(ev.data) as SigMsg;
      switch (msg.type) {
        case "ring":
          setIncomingFrom(msg.from);
          setCallId(msg.callId);
          setPeerId(msg.from);
          setState("ringing-in");
          break;
        case "offer": {
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
          } catch {}
          break;
        }
        case "reject":
          setState("ended");
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
  }, [wsUrl]);

  const getMic = async () => {
    if (localStreamRef.current) return localStreamRef.current;
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true },
      video: false,
    });
    localStreamRef.current = stream;
    return stream;
  };

  const call = async (toUserId: string) => {
    setPeerId(toUserId);
    setState("ringing-out");
    const id = crypto.randomUUID();
    setCallId(id);
    wsSend({ type: "ring", callId: id, to: toUserId });

    const pc = ensurePc();
    const stream = await getMic();
    stream.getTracks().forEach((t) => pc.addTrack(t, stream));
    const offer = await pc.createOffer({ offerToReceiveAudio: true });
    await pc.setLocalDescription(offer);
    wsSend({ type: "offer", callId: id, to: toUserId, sdp: offer });
  };

  const accept = () => {
    setState("connecting");
    setIncomingFrom(null);
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
    state,
    incomingFrom,
    muted,
    call,
    accept,
    reject,
    hangup,
    toggleMute,
    bindRemoteAudio,
  };
}

import { useEffect, useMemo, useRef, useState } from "react";

type SigMsg =
  | { type: "ring"; callId: string; from: string; to: string }
  | { type: "accept"; callId: string; from: string; to: string } // <— NUEVO
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
  // arriba, junto al resto de refs:
  const peerIdRef = useRef<string | null>(null);
  useEffect(() => {
    peerIdRef.current = peerId;
  }, [peerId]);
  const wsUrl = useMemo(
    () => `${wsBase}?token=${encodeURIComponent(jwt)}`,
    [wsBase, jwt]
  );

  const ensurePc = () => {
    if (pcRef.current) return pcRef.current;
    const pc = new RTCPeerConnection({ iceServers: STUN });

    pc.oniceconnectionstatechange = () => {
      console.log("ICE state:", pc.iceConnectionState);
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") setState("talking");
      if (["failed", "disconnected", "closed"].includes(pc.connectionState)) {
        setState("ended");
      }
    };

    pc.onicecandidate = (ev) => {
      if (!ev.candidate) {
        console.log("ICE gathering complete");
        return;
      }
      const to = peerIdRef.current;
      if (to) {
        wsSend({
          type: "candidate",
          callId, // opcional, pero lo mantenemos
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

  // Conexión WebSocket
  useEffect(() => {
    const ws = new WebSocket(wsUrl);

    ws.onmessage = async (ev) => {
      console.log("Mensaje recibido:", ev.data);
      const msg = JSON.parse(ev.data) as SigMsg;
      console.log("Mensaje decodificado:", msg);
      switch (msg.type) {
        case "ring":
          setIncomingFrom(msg.from);
          setCallId(msg.callId);
          setPeerId(msg.from);
          setState("ringing-in");
          break;
        case "offer": {
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
        // al recibir candidate:
        case "candidate": {
          console.log("← recibido candidate");
          const pc = ensurePc();
          try {
            await pc.addIceCandidate(msg.candidate);
            console.log("✓ addIceCandidate ok");
          } catch (e) {
            console.error("✗ addIceCandidate error", e);
          }
          break;
        }
        case "accept": {
          // Soy el caller y el callee aceptó
          setPeerId(msg.from);
          if (!callId) setCallId(msg.callId);
          await createAndSendOffer(msg.from, msg.callId);
          setState("connecting");
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
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: false,
    });
    console.log("Tengo micro local:", stream.getAudioTracks().length, "tracks");
    localStreamRef.current = stream;
    return stream;
  };

  const call = async (toUserId: string) => {
    setPeerId(toUserId);
    setState("ringing-out");
    const id = crypto.randomUUID();
    setCallId(id);
    wsSend({ type: "ring", callId: id, to: toUserId }); // <— solo ring
    // Quita todo lo de crear PC/offer aquí.
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
    setState("connecting"); // UI feedback
    setIncomingFrom(null);
    if (peerId && callId) {
      wsSend({ type: "accept", callId, to: peerId }); // <— AVISA AL CALLER
    }
    // Espera el offer del caller; cuando llegue, contestas (bloque "offer" de abajo)
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

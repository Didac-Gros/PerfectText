import { useState, useEffect, useRef } from 'react';

interface AudioCallState {
  isActive: boolean;
  isConnecting: boolean;
  error: string | null;
  localStream: MediaStream | null;
}

export const useAudioCall = () => {
  const [callState, setCallState] = useState<AudioCallState>({
    isActive: false,
    isConnecting: false,
    error: null,
    localStream: null
  });

  // Estado separado para el micrófono - encendido por defecto
  const [micOn, setMicOn] = useState(true);

  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  // useEffect para asegurar que el audio esté activado en el primer render
  useEffect(() => {
    if (localStreamRef.current && callState.isActive) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = micOn;
        console.log(`🎤 Audio inicializado: ${micOn ? 'encendido' : 'apagado'}`);
      }
    }
  }, [callState.isActive, micOn]);
  // Inicializar conexión de audio
  const startCall = async () => {
    try {
      setCallState(prev => ({ ...prev, isConnecting: true, error: null }));

      // Solicitar acceso al micrófono
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: false
      });

      localStreamRef.current = stream;

      // Asegurar que el micrófono esté encendido por defecto
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = micOn; // true por defecto
        console.log(`🎤 Micrófono inicializado: ${micOn ? 'encendido' : 'apagado'}`);
      }

      // Crear conexión WebRTC
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      peerConnectionRef.current = peerConnection;

      // Añadir stream local a la conexión
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      // Manejar stream remoto
      peerConnection.ontrack = (event) => {
        const [remoteStream] = event.streams;
        // Aquí se reproduciría el audio remoto
        const audioElement = new Audio();
        audioElement.srcObject = remoteStream;
        audioElement.play();
      };

      setCallState(prev => ({
        ...prev,
        isActive: true,
        isConnecting: false,
        localStream: stream
      }));

      console.log('🎤 Micrófono activado y llamada iniciada');
      
    } catch (error) {
      console.error('Error al iniciar llamada:', error);
      setCallState(prev => ({
        ...prev,
        isConnecting: false,
        isActive: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }));
    }
  };

  // Terminar llamada
  const endCall = () => {
    // Detener stream local
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      localStreamRef.current = null;
    }

    // Cerrar conexión WebRTC
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Resetear estado del micrófono
    setMicOn(true);

    setCallState({
      isActive: false,
      isConnecting: false,
      error: null,
      localStream: null
    });
  };

  // Toggle del micrófono - usar localStream.getAudioTracks()[0].enabled
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        // Cambiar el estado del micrófono
        const newMicState = !micOn;
        setMicOn(newMicState);
        
        // Aplicar el cambio al audio track
        audioTrack.enabled = newMicState;
        
        console.log(`🎤 Micrófono ${newMicState ? 'encendido' : 'apagado'}`);
      }
    }
  };

  // Limpiar recursos al desmontar
  useEffect(() => {
    return () => {
      endCall();
    };
  }, []);

  return {
    callState,
    micOn,
    startCall,
    endCall,
    toggleMute
  };
};
import { cleanupAudioResources } from './audio';

export interface VADOptions {
  minNoiseLevel: number;      // Nivel mínimo de ruido para considerar actividad de voz
  silenceThreshold: number;   // Duración del silencio para considerar una pausa (en ms)
  minSpeechSegment: number;   // Duración mínima de un segmento de voz (en ms)
}

const DEFAULT_VAD_OPTIONS: VADOptions = {
  minNoiseLevel: 0.01,        // 1% del rango máximo
  silenceThreshold: 500,      // 500ms de silencio
  minSpeechSegment: 250,      // 250ms mínimo de voz
};

export class VoiceActivityDetector {
  private audioContext: AudioContext;
  private analyser: AnalyserNode;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isRecording = false;
  private isSpeaking = false;
  private lastVoiceActivity = 0;
  private currentSegmentStart = 0;
  private options: VADOptions;
  private processor: ScriptProcessorNode;
  private source: MediaStreamAudioSourceNode;
  private onSpeechStart: () => void;
  private onSpeechEnd: () => void;
  private isPaused = false;

  constructor(
    stream: MediaStream,
    options: Partial<VADOptions> = {},
    onSpeechStart?: () => void,
    onSpeechEnd?: () => void
  ) {
    this.options = { ...DEFAULT_VAD_OPTIONS, ...options };
    this.onSpeechStart = onSpeechStart || (() => {});
    this.onSpeechEnd = onSpeechEnd || (() => {});

    this.audioContext = new AudioContext();
    this.source = this.audioContext.createMediaStreamSource(stream);
    this.analyser = this.audioContext.createAnalyser();
    this.processor = this.audioContext.createScriptProcessor(2048, 1, 1);

    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.8;

    this.source.connect(this.analyser);
    this.analyser.connect(this.processor);
    this.processor.connect(this.audioContext.destination);

    this.setupVAD();
    this.setupMediaRecorder(stream);
  }

  private setupVAD() {
    const dataArray = new Float32Array(this.analyser.frequencyBinCount);

    this.processor.onaudioprocess = () => {
      if (this.isPaused) return;

      this.analyser.getFloatTimeDomainData(dataArray);
      
      // Calcular el nivel de energía de la señal
      const energy = Math.sqrt(
        dataArray.reduce((acc, val) => acc + val * val, 0) / dataArray.length
      );

      const now = Date.now();
      
      if (energy > this.options.minNoiseLevel) {
        if (!this.isSpeaking) {
          this.isSpeaking = true;
          this.currentSegmentStart = now;
          this.onSpeechStart();
        }
        this.lastVoiceActivity = now;
      } else if (this.isSpeaking && (now - this.lastVoiceActivity > this.options.silenceThreshold)) {
        if (now - this.currentSegmentStart > this.options.minSpeechSegment) {
          this.isSpeaking = false;
          this.onSpeechEnd();
        }
      }
    };
  }

  private setupMediaRecorder(stream: MediaStream) {
    this.mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm'
    });

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0 && !this.isPaused) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.onstop = () => {
      const finalBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
      this.audioChunks = [];
      return finalBlob;
    };
  }

  public start() {
    this.isRecording = true;
    this.isPaused = false;
    this.audioChunks = [];
    if (this.mediaRecorder) {
      this.mediaRecorder.start(100);
    }
  }

  public pause() {
    this.isPaused = true;
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
    }
  }

  public resume() {
    this.isPaused = false;
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
    }
  }

  public stop(): Blob {
    this.isRecording = false;
    this.isPaused = false;
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
    }
    
    const finalBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
    this.cleanup();
    return finalBlob;
  }

  public cleanup() {
    if (this.processor) {
      this.processor.disconnect();
    }
    if (this.source) {
      this.source.disconnect();
    }
    if (this.analyser) {
      this.analyser.disconnect();
    }
    if (this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
    this.audioChunks = [];
  }
}
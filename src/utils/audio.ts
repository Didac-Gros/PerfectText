import { MutableRefObject } from 'react';

export interface AudioVisualizerConfig {
  backgroundColor: string;
  waveformColor: string;
  waveformShadowColor: string;
  intensityColor: string;
}

export const setupAudioContext = async (stream: MediaStream) => {
  const audioContext = new AudioContext();
  const source = audioContext.createMediaStreamSource(stream);
  const analyser = audioContext.createAnalyser();
  
  analyser.fftSize = 2048;
  analyser.smoothingTimeConstant = 0.85;
  
  source.connect(analyser);
  
  return { audioContext, analyser };
};

export const optimizeAudioBlob = async (blob: Blob): Promise<Blob> => {
  const MAX_SIZE_MB = 24; // Keep under OpenAI's 25MB limit
  const TARGET_SAMPLE_RATE = 16000;
  const TARGET_CHANNELS = 1; // Mono
  
  // First, check if we need to optimize
  const sizeMB = blob.size / (1024 * 1024);
  if (sizeMB <= MAX_SIZE_MB) {
    return blob;
  }

  const audioContext = new AudioContext();
  
  // Convert the Blob to ArrayBuffer
  const arrayBuffer = await blob.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  
  // Calculate compression ratio needed
  const compressionRatio = MAX_SIZE_MB / sizeMB;
  
  // Create a shorter duration if needed
  const targetDuration = audioBuffer.duration * compressionRatio;
  
  // Create an offline context with reduced quality
  const offlineContext = new OfflineAudioContext(
    TARGET_CHANNELS,
    Math.floor(targetDuration * TARGET_SAMPLE_RATE),
    TARGET_SAMPLE_RATE
  );

  // Create source buffer
  const source = offlineContext.createBufferSource();
  source.buffer = audioBuffer;

  // Add compression
  const compressor = offlineContext.createDynamicsCompressor();
  compressor.threshold.setValueAtTime(-24, 0);
  compressor.knee.setValueAtTime(40, 0);
  compressor.ratio.setValueAtTime(12, 0);
  compressor.attack.setValueAtTime(0, 0);
  compressor.release.setValueAtTime(0.25, 0);

  // Connect nodes
  source.connect(compressor);
  compressor.connect(offlineContext.destination);

  // Start rendering
  source.start(0);
  const renderedBuffer = await offlineContext.startRendering();

  // Convert to WAV with reduced bit depth
  const wavBuffer = audioBufferToWav(renderedBuffer, {
    float32: false,    // Use 16-bit instead of 32-bit
    bitDepth: 16       // Reduce bit depth
  });
  
  const optimizedBlob = new Blob([wavBuffer], { type: 'audio/wav' });
  
  // Verify size and recursively optimize if still too large
  if (optimizedBlob.size / (1024 * 1024) > MAX_SIZE_MB) {
    // If still too large, try more aggressive optimization
    return await optimizeAudioBlob(optimizedBlob);
  }
  
  return optimizedBlob;
};

interface WavOptions {
  float32?: boolean;
  bitDepth?: number;
}

// Enhanced WAV converter with compression options
function audioBufferToWav(buffer: AudioBuffer, options: WavOptions = {}): ArrayBuffer {
  const { float32 = false, bitDepth = 16 } = options;
  const numChannels = 1; // Always mono for our use case
  const sampleRate = buffer.sampleRate;
  const format = float32 ? 3 : 1; // PCM = 1, Float = 3
  
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  
  const data = buffer.getChannelData(0);
  const dataLength = data.length * bytesPerSample;
  const bufferLength = 44 + dataLength;
  
  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);
  
  // WAV header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, bufferLength - 8, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);
  
  // Write audio data with compression
  const offset = 44;
  if (float32) {
    for (let i = 0; i < data.length; i++) {
      view.setFloat32(offset + (i * 4), data[i], true);
    }
  } else {
    const samples = new Int16Array(data.length);
    for (let i = 0; i < data.length; i++) {
      // Apply soft clipping to reduce peaks
      const sample = Math.max(-1, Math.min(1, data[i]));
      samples[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
    }
    
    for (let i = 0; i < samples.length; i++) {
      view.setInt16(offset + (i * 2), samples[i], true);
    }
  }
  
  return arrayBuffer;
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

let previousValues: number[] = [];
const SMOOTHING_POINTS = 8;

const smoothValue = (newValue: number, index: number): number => {
  if (!previousValues[index]) {
    previousValues[index] = newValue;
  }
  
  const smoothingFactor = 0.15;
  previousValues[index] += (newValue - previousValues[index]) * smoothingFactor;
  
  return previousValues[index];
};

export const drawAudioVisualization = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  analyser: AnalyserNode,
  dataArray: Float32Array,
  frequencyData: Uint8Array,
  config: AudioVisualizerConfig,
  isMinimized: boolean,
  isPaused: boolean
) => {
  ctx.fillStyle = config.backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.lineWidth = isMinimized ? 1.5 : 2.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  
  const sliceWidth = canvas.width / (analyser.frequencyBinCount / 4);
  let x = 0;

  // Si está pausado, dibujamos una línea plana en el centro
  if (isPaused) {
    const centerY = canvas.height / 2;
    
    // Dibujamos una línea plana con pequeñas variaciones para que se vea como "en pausa"
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    
    for (let i = 0; i < canvas.width; i += 20) {
      // Pequeñas variaciones para indicar estado de pausa
      const pauseOffset = Math.sin(i * 0.05) * 2;
      ctx.lineTo(i, centerY + pauseOffset);
      ctx.lineTo(i + 10, centerY + pauseOffset);
    }
    
    ctx.stroke();
    
    // Añadir indicador visual de pausa
    if (!isMinimized) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.font = '48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSADO', canvas.width / 2, canvas.height / 2 - 50);
    }
    
    return;
  }

  // Calcular la amplitud promedio para ajuste dinámico
  let sumAmplitude = 0;
  for (let i = 0; i < analyser.frequencyBinCount; i++) {
    sumAmplitude += Math.abs(dataArray[i]);
  }
  const avgAmplitude = sumAmplitude / analyser.frequencyBinCount;
  
  // Aumentar significativamente la amplificación base y dinámica
  const baseAmplification = 3.5;
  const dynamicAmplification = baseAmplification + (1 - avgAmplitude) * 4.0;

  let points: { x: number; y: number }[] = [];

  for (let i = 0; i < analyser.frequencyBinCount; i += 4) {
    const rawValue = dataArray[i] * dynamicAmplification;
    const smoothedValue = smoothValue(rawValue, Math.floor(i/4));
    
    const amplifiedV = Math.sign(smoothedValue) * Math.pow(Math.abs(smoothedValue), 0.7);
    
    const amplitudeFactor = isMinimized ? 0.6 : 1.4;
    const y = (canvas.height / 2) * (1 + amplifiedV * amplitudeFactor);
    
    points.push({ x, y });
    x += sliceWidth;
  }

  if (points.length > 0) {
    // Dibujar la línea principal
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length - 2; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    
    if (points.length > 2) {
      const lastPoint = points[points.length - 1];
      const secondLastPoint = points[points.length - 2];
      ctx.quadraticCurveTo(
        secondLastPoint.x,
        secondLastPoint.y,
        lastPoint.x,
        lastPoint.y
      );
    }
    
    ctx.stroke();

    // Añadir un efecto de brillo sutil
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = isMinimized ? 3 : 5;
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length - 2; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    
    if (points.length > 2) {
      const lastPoint = points[points.length - 1];
      const secondLastPoint = points[points.length - 2];
      ctx.quadraticCurveTo(
        secondLastPoint.x,
        secondLastPoint.y,
        lastPoint.x,
        lastPoint.y
      );
    }
    
    ctx.stroke();
  }
};

export const formatTime = (seconds: number): string => {    
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const setupCanvas = (
  canvas: HTMLCanvasElement,
  isMinimized: boolean
): void => {
  const parentWidth = window.innerWidth;
  const parentHeight = isMinimized ? 40 : window.innerHeight;
  
  canvas.width = parentWidth;
  canvas.height = parentHeight;
  
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#3B82F6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
};

export const cleanupAudioResources = (
  animationFrame: number | undefined,
  timer: NodeJS.Timeout | undefined,
  audioContext: AudioContext | null,
  audioUrl: string | undefined
): void => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
  }
  if (timer) {
    clearInterval(timer);
  }
  if (audioContext) {
    audioContext.close();
  }
  if (audioUrl) {
    URL.revokeObjectURL(audioUrl);
  }
  
  previousValues = [];
};
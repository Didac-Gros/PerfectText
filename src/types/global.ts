import { Timestamp } from "firebase/firestore";

export interface Language {
  code: string;
  name: string;
  flag: string;
}

export interface CorrectionResponse {
  corrected: string;
  enhanced: string;
}

export interface ErrorResponse {
  error: string;
}

export interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Quiz {
  id: string;
  questions: Question[];
  createdAt: Timestamp;
  score: number;
  answers: { correct: boolean; time: number }[];
  titleFile: string;
  rated: boolean;
}

export interface ConceptMap {
  id: string;
  createdAt: Timestamp;
  mapTitle: string;
  root: Node;
}

export interface Node {
  id: string;
  label: string;
  children?: Node[];
}

export interface User {
  uid: string;
  name: string;
  email: string;
  expirationDate: Timestamp;
  customerId: string | null;
  subscription: UserSubscription;
  tokens: number | null;
}

export enum UserSubscription {
  FREE = "Gratuito",
  PRO = "Estándar",
  ELITE = "Premium",

  TOKENSFREE = 1000000,
  TOKENSPRO = 10000000,
}

export type TabType =
  | ""
  | "home"
  | "correct"
  | "summarize"
  | "quiz"
  | "conceptmap"
  | "plans"
  | "traductor"
  | "voice";

export interface TranscriptionChunk {
  id: string;
  text: string;
  timestamp: number;
}

export interface AudioRecorderState {
  isRecording: boolean;
  mediaRecorder: MediaRecorder | null;
  audioChunks: Blob[];
}

export interface FileData {
  path: string; // La ruta en el servidor donde se almacena el archivo
  originalname: string; // El nombre original del archivo cuando fue subido
  mimetype: string; // El tipo de archivo (ejemplo: 'application/pdf', 'image/png')
  size: number; // El tamaño del archivo en bytes
}

export interface Board {
  id: string;
  title: string;
  members: Member[];
  createdAt: string;
  updatedAt: string;
  lists: List[];
  dueDate?: string | null;
  background?: {
    type: "image" | "gradient";
    value: string;
  };
}

export interface Member {
  userId: string;
  rol: string;
  isAdmin: boolean;
}

export interface List {
  id: string;
  title: string;
  cards: Card[];
  color?: string;
}

export interface Card {
  id: string;
  title: string;
  description: string;
  views: number;
  comments: Comment[];
  dueDate?: string | null;
  completed?: boolean;
  // assignees: string[];
  // labels: Label[];
  // checklist: ChecklistItem[];
}

export interface Comment {
  id: string;
  text: string;
  author: string;
  createdAt: string;
  // attachments?: CommentAttachment[];
}

export interface CommentAttachment {
  id: string;
  type: "image" | "file";
  url: string;
  name: string;
  size?: number;
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export type SidebarType = "" | "myspace" | "boards" | "calendar";

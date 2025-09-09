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

export interface Studies {
  uni: string;
  career: string;
  year: string;
}

export interface User {
  uid: string;
  name: string;
  email: string;
  expirationDate?: Timestamp;
  customerId: string | null;
  subscription: UserSubscription;
  tokens: number | null;
  profileImage: string;
  boardsCreated: boolean;
  studies?: Studies;
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
  lastViewed: string;
  background?: {
    type: "image" | "gradient";
    value: string;
  } | null;
}

export interface Member {
  userId: string;
  isAdmin: boolean;
  image: string;
  name: string;
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
  photoURL: string;
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

export type GoogleUser = {
  name: string;
  email: string;
  picture: string;
};

export type SidebarType =
  | ""
  | "myspace"
  | "boards"
  | "calendar"
  | "campus"
  | "calls"
  | "notifications"
  | "profile";

export type AcceptInvitationError = "" | "memberExists" | "notExists" | "error";

export type TypeMood =
  | "😴 Aburrid@ (pero disponible)"
  | "📱 Con mil cosas menos esta clase"
  | "😌 Demasiado tranqui"
  | "🤯 Saturad@ pero smiling"
  | "👀 Atent@ a la clase (más o menos)"
  | "🫣 Con ganas de algo distinto"
  | "🙃 Con ganas de juego"
  | "💬 Modo hablar sin decir mucho";

export interface Reaction {
  emoji: string;
  count: number;
  usersId: string[];
}

export interface FeelComment {
  id: string;
  content: string;
  userId: string;
  createdAt: string;
  usersIdLikes: string[];
  isLiked?: boolean;
  likesCount?: number;
}

export interface Feel {
  id: string;
  userId: string;
  mood: TypeMood;
  content: string;
  reactions: Reaction[];
  comments: FeelComment[];
  createdAt: string;
}

export interface Call {
  id: string;
  callerUser: string;
  calleeUser: string;
  createdAt: string;
  duration: number;
}

export type CallRole = "caller" | "callee" | null;

export type NotificationType = "reaction" | "like" | "comment" | "call";

export interface Notification {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderStudies?: Studies;
  userReceiverId: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  feelId?: string;
  type: NotificationType;
}

export interface EventOrganizer {
  name: string;
  avatar: string;
  studies: Studies;
}

export interface EventCategory {
  name: string;
  color: string;
  selectedColor: string;
  emoji: string;
}

// export type EventCategory = [
//   {
//     id: "study";
//     name: "Estudio";
//     color: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100";
//     selectedColor: "bg-blue-500 text-white border-blue-500";
//     emoji: "📚";
//   },
//   {
//     id: "social";
//     name: "Social";
//     color: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100";
//     selectedColor: "bg-green-500 text-white border-green-500";
//     emoji: "🎉";
//   },
//   {
//     id: "sports";
//     name: "Deporte";
//     color: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100";
//     selectedColor: "bg-orange-500 text-white border-orange-500";
//     emoji: "⚽";
//   },
//   {
//     id: "culture";
//     name: "Cultural";
//     color: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100";
//     selectedColor: "bg-purple-500 text-white border-purple-500";
//     emoji: "🎭";
//   },
//   {
//     id: "food";
//     name: "Comida";
//     color: "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100";
//     selectedColor: "bg-yellow-500 text-white border-yellow-500";
//     emoji: "🍕";
//   },
//   {
//     id: "other";
//     name: "Otro";
//     color: "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100";
//     selectedColor: "bg-gray-500 text-white border-gray-500";
//     emoji: "📌";
//   },
// ];

export interface Event {
  id: string;
  title: string;
  description: string;
  organizerId: string;
  date: string;
  time: string;
  location: string;
  attendees: string[];
  maxAttendees?: number;
  category: EventCategory;
  isAttending?: boolean;
  image?: string;
}

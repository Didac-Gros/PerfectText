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

export type TabType = "home" | "correct" | "summarize" | "quiz" | "conceptmap" | "plans";

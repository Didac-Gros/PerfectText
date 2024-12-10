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

export interface Node {
  id: string;
  label: string;
  children?: Node[];
}

export interface User {
  uid: string;
  name: string;
  email: string;
  subscription: UserSubscription;
  tokens: number;
}

export enum UserSubscription {
  FREE = "Gratuito",
  STANDARD = "Estándar",
  PREMIUM = "Premium",

  TOKENSFREE = 1000000,
  TOKENSSTANDARD = 10000000,
}

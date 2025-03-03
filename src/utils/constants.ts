import { Language } from "../types/global";
import cataloniaFlag from "../assets/Flag_of_Catalonia.svg";

export const API_URL = "https://perfecttext.onrender.com/api";
export const API_URL_LOCAL = "http://localhost:3000/api";

export const STRIPE_ESTANDAR = "prod_RO65nOZ8xgE8Gs";
export const STRIPE_PREMIUM = "prod_RK0SNcBX9KfsC4";

export const mainLanguages: Language[] = [
  { code: "ES", name: "Español", flag: "https://flagcdn.com/es.svg" },
  { code: "EN", name: "English", flag: "https://flagcdn.com/gb.svg" },
  { code: "CA", name: "Català", flag: "img/Flag_of_Catalonia.svg" },
  { code: "FR", name: "Français", flag: "https://flagcdn.com/fr.svg" },
  // { code: "de", name: "Deutsch", flag: "https://flagcdn.com/de.svg" },
];

export const additionalLanguages: Language[] = [
  { code: "IT", name: "Italiano", flag: "https://flagcdn.com/it.svg" },
  { code: "ZH", name: "中文 (Chino)", flag: "https://flagcdn.com/cn.svg" },
  { code: "HI", name: "हिन्दी (Hindi)", flag: "https://flagcdn.com/in.svg" },
  { code: "AR", name: "العربية (Árabe)", flag: "https://flagcdn.com/sa.svg" },
  { code: "BN", name: "বাংলা (Bengalí)", flag: "https://flagcdn.com/bd.svg" },
  { code: "PT", name: "Português", flag: "https://flagcdn.com/pt.svg" },
  { code: "RU", name: "Русский (Ruso)", flag: "https://flagcdn.com/ru.svg" },
  { code: "JA", name: "日本語 (Japonés)", flag: "https://flagcdn.com/jp.svg" },
  { code: "TR", name: "Türkçe (Turco)", flag: "https://flagcdn.com/tr.svg" },
  { code: "KO", name: "한국어 (Coreano)", flag: "https://flagcdn.com/kr.svg" },
  {
    code: "VI",
    name: "Tiếng Việt (Vietnamita)",
    flag: "https://flagcdn.com/vn.svg",
  },
];

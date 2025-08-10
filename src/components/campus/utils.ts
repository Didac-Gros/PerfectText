import { TypeMood } from "../../types/global";

export function getColorFromMood(mood: TypeMood): string {
  switch (mood) {
    case "😴 Aburrid@ (pero disponible)":
      return "bg-blue-100 text-blue-800";
    case "📱 Con mil cosas menos esta clase":
      return "bg-purple-100 text-purple-800";
    case "😌 Demasiado tranqui":
      return "bg-green-100 text-green-800";
    case "🤯 Saturad@ pero smiling":
      return "bg-red-100 text-red-800";
    case "👀 Atent@ a la clase (más o menos)":
      return "bg-yellow-100 text-yellow-800";
    case "🫣 Con ganas de algo distinto":
      return "bg-pink-100 text-pink-800";
    case "🙃 Con ganas de juego":
      return "bg-orange-100 text-orange-800";
    case "💬 Modo hablar sin decir mucho":
      return "bg-emerald-100 text-emerald-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

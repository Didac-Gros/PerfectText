import React, { useState } from "react";
import { Avatar } from "../shared/Avatar";
import { Smile, MapPin, Calendar } from "lucide-react";

interface CreateFeelProps {
  name: string;
  avatar: string;
  onPost: (
    content: string,
    mood: { emoji: string; name: string; color: string }
  ) => void;
}

const moods = [
  {
    emoji: "😴",
    name: "Aburrid@ (pero disponible)",
    color: "bg-blue-100 text-blue-800",
    placeholder: "No está pasando nada… pero podría estar pasando algo 👀",
  },
  {
    emoji: "📱",
    name: "Con mil cosas menos esta clase",
    color: "bg-purple-100 text-purple-800",
    placeholder:
      "Estoy mirando el móvil como si fuera a pasar algo interesante…",
  },
  {
    emoji: "😌",
    name: "Demasiado tranqui",
    color: "bg-green-100 text-green-800",
    placeholder: "Todo bien, pero no me molestaría que alguien aparezca…",
  },
  {
    emoji: "🤯",
    name: "Saturad@ pero smiling",
    color: "bg-red-100 text-red-800",
    placeholder: "No doy más, acepto rescates, planes, señales o lo que venga",
  },
  {
    emoji: "👀",
    name: "Atent@ a la clase (más o menos)",
    color: "bg-yellow-100 text-yellow-800",
    placeholder: "Estoy mirando algo… o alguien. Tú sabrás.",
  },
  {
    emoji: "🫣",
    name: "Con ganas de algo distinto",
    color: "bg-pink-100 text-pink-800",
    placeholder: "Este día pide algo… no sé, pero lo sabes.",
  },
  {
    emoji: "🙃",
    name: "Con ganas de juego",
    color: "bg-orange-100 text-orange-800",
    placeholder: "No estoy buscando nada, pero tampoco lo evito.",
  },
  {
    emoji: "💬",
    name: "Modo hablar sin decir mucho",
    color: "bg-emerald-100 text-emerald-800",
    placeholder:
      "Si alguien quiere empezar, finjo que no esperaba el mensaje 😌",
  },
];

export const CreateFeel: React.FC<CreateFeelProps> = ({
  name,
  avatar,
  onPost,
}) => {
  const [content, setContent] = useState("");
  const [selectedMood, setSelectedMood] = useState(moods[0]);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Update placeholder when mood changes
  const currentPlaceholder =
    selectedMood.placeholder || "¿Cómo te sientes hoy en clase?";
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onPost(content, selectedMood);
      setContent("");
      setSelectedMood(moods[0]);
    }
  };

  if (!showForm) {
    return (
        <button
          onClick={() => setShowForm(true)}
          className="group w-full bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 rounded-2xl p-6 border border-gray-100/50 hover:border-blue-200/50 transition-all duration-300 text-left hover:shadow-lg hover:shadow-blue-100/20 hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar
                  src={avatar}
                  alt={name}
                  size="md"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-200">
                  <span className="text-xs">💭</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-900 transition-colors duration-200">
                  Compartir feel
                </h3>
                <p className="text-gray-500 text-sm group-hover:text-gray-600 transition-colors duration-200">
                  {currentPlaceholder}
                </p>
              </div>
            </div>
          </div>
        </button>
    );
  }

  return (
    <div className="bg-white/80 rounded-xl p-5 mb-6 border border-gray-200/40 backdrop-blur-md shadow-sm">
      <form onSubmit={handleSubmit}>
        <div className="flex items-start space-x-3 mb-3 justify-center">
          <Avatar src={avatar} alt={name} size="md" />
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`${currentPlaceholder} (desaparece a las 6am)`}
              className="w-full resize-none border-none outline-none text-gray-900 placeholder-gray-500 text-sm bg-transparent"
              rows={3}
              maxLength={280}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMoodPicker(!showMoodPicker)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${selectedMood.color} hover:opacity-80`}
              >
                <span className="text-sm">{selectedMood.emoji}</span>
                <span>{selectedMood.name}</span>
                <Smile className="w-3 h-3" />
              </button>

              {showMoodPicker && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100/80 p-6 z-[99999] grid grid-cols-4 gap-4 backdrop-blur-sm min-w-max">
                  {moods.map((mood) => (
                    <button
                      key={mood.name}
                      type="button"
                      onClick={() => {
                        setSelectedMood(mood);
                        setShowMoodPicker(false);
                      }}
                      className={`group relative flex items-center justify-center w-10 h-10 rounded-xl hover:bg-gray-50 hover:scale-110 transition-all duration-200 ${
                        selectedMood.name === mood.name ? "bg-gray-100" : ""
                      }`}
                      title={mood.name}
                    >
                      <span className="text-xl">{mood.emoji}</span>

                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                        {mood.name}
                        {/* Arrow */}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              className="flex items-center space-x-1 px-2 py-1 rounded-full text-gray-500 hover:bg-gray-100 transition-colors duration-150"
            >
              <MapPin className="w-4 h-4" />
              <span className="text-xs">Campus</span>
            </button>

            <button
              type="button"
              className="flex items-center space-x-1 px-2 py-1 rounded-full text-gray-500 hover:bg-gray-100 transition-colors duration-150"
            >
              <Calendar className="w-4 h-4" />
              <span className="text-xs">Clase</span>
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <span
              className={`text-xs ${content.length > 250 ? "text-red-500" : "text-gray-400"}`}
            >
              {content.length}/280
            </span>
            <button
              type="submit"
              disabled={!content.trim() || content.length > 280}
              className="px-4 py-1.5 bg-blue-500 text-white text-sm font-medium rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
            >
              Compartir feel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

import React, { useEffect, useState } from "react";
import { User, Camera, Save, X, Check, Search } from "lucide-react";
import { Avatar } from "../components/shared/Avatar";
import { auth } from "../services/firestore/firebase";
import { Studies } from "../types/global";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const avatarOptions = [
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=maria&size=128",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=ana&size=128",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=carlos&size=128",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=sofia&size=128",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=diego&size=128",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=laura&size=128",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=javier&size=128",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=emma&size=128",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=pablo&size=128",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=elena&size=128",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=alex&size=128",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=sara&size=128",
];

const universities = [
  "Universidad de Barcelona (UB)",
  "Universidad Autónoma de Barcelona (UAB)",
  "Universidad Politécnica de Cataluña (UPC)",
  "Universidad Pompeu Fabra (UPF)",
  "Universidad de Lleida (UdL)",
  "Universidad de Girona (UdG)",
  "Universidad Rovira i Virgili (URV)",
  "Universidad Abat Oliba CEU (UAO)",
  "Universidad Internacional de Cataluña (UIC)",
  "Universidad Europea de Barcelona (European University) (EU)",
  "Universidad Oberta de Cataluña (UOC)",
  "Harbour.Space University (HSU)",
  "Universidad de Vic - Universidad Central de Cataluña (UVic)",
  "Universidad de Alcalá (UAH)",
  "Universidad Alfonso X el Sabio (UAX)",
  "Universidad de Alicante (UA)",
  "Universidad de Almería (UAL)",
  "Universidad Internacional de Andalucía (UNIA)",
  "Universidad Católica de Ávila (UCAV)",
  "Atlantic-Mediterranean Technological University (ATU)",
  "Universidad Europea del Atlántico (UNEATLANTICO)",
  "Universidad del Atlántico Medio (UNAM)",
  "Universidad de las Islas Baleares (UIB)",
  "Universidad del País Vasco (UPV/EHU)",
  "Universidad de Burgos (UBU)",
  "Universidad de Cádiz (UCA)",
  "Universidad Camilo José Cela (UCJC)",
  "Universidad Europea de Canarias (UEC)",
  "Universidad de Cantabria (UC)",
  "Universidad Politécnica de Cartagena (UPCT)",
  "Universidad de Castilla-La Mancha (UCLM)",
  "Universidad CEU Cardenal Herrera (CEU-UCH)",
  "Universidad CEU San Pablo (CEU-SP)",
  "Universidad Carlos III de Madrid (UC3M)",
  "Universidad Pontificia Comillas (UPCO)",
  "Universidad de Córdoba (UCO)",
  "Universidad de A Coruña (UDC)",
  "Universidad de Deusto (UD)",
  "Universidad de Diseño, Innovación y Tecnología (UDIT)",
  "Universidad Nacional de Educación a Distancia (UNED)",
  "Universidad Miguel Hernández (UMH)",
  "ESIC University (ESIC)",
  "Universidad Europea de Madrid (UEM)",
  "Universidad Politécnica de Madrid (UPM)",
  "Universidad de Extremadura (UEX)",
  "Universidad Fernando III (UFIII)",
  "Universidad Fernando Pessoa Canarias (UFPC)",
  "Universidad Francisco de Vitoria (UFV)",
  "Universidad Complutense de Madrid (UCM)",
  "Universidad a Distancia de Madrid (UDIMA)",
  "Universidad de Málaga (UMA)",
  "Universidad de Murcia (UMU)",
  "Universidad Internacional Menéndez Pelayo (UIMP)",
  "Universidad Europea Miguel de Cervantes (UEMC)",
  "Mondragón Unibertsitatea (MU)",
  "Universidad de Navarra (UNAV)",
  "Universidad Pública de Navarra (UPNA)",
  "Universidad Nebrija (UNB)",
  "Universidad de Oviedo (UNIOVI)",
  "Universidad Pablo de Olavide (UPO)",
  "Universidad de Las Palmas de Gran Canaria (ULPGC)",
  "Universidad de Salamanca (USAL)",
  "Universidad Pontificia de Salamanca (UPSA)",
  "Universidad Católica San Antonio de Murcia (UCAM)",
  "Universidad San Dámaso (USD)",
  "Universidad San Jorge (USJ)",
  "Universidad Católica de Valencia San Vicente Mártir (UCV)",
  "Universidad de Santiago de Compostela (USC)",
  "Universidad de Sevilla (US)",
  "Universidad de Valencia (UV)",
  "Universidad Internacional Valenciana (VIU)",
  "Universidad Politécnica de Valencia (UPV)",
  "Universidad de Valladolid (UVA)",
  "Universidad de Vigo (UVIGO)",
  "Universidad Villanueva (UVILL)",
  "Universidad de Zaragoza (UNIZAR)",
];

const majors = [
  // Ciencias Sociales y Humanidades
  "Administración y Dirección de Empresas",
  "Administración y Gestión Pública",
  "Antropología",
  "Ciberseguridad",
  "Ciencias Políticas",
  "Comunicación Audiovisual",
  "Criminología",
  "Derecho",
  "Economía",
  "Filosofía",
  "Geografía",
  "Historia",
  "Historia del Arte",
  "Lenguas Modernas",
  "Lingüística",
  "Literatura",
  "Marketing e Investigación de Mercados",
  "Periodismo",
  "Psicología",
  "Publicidad y Relaciones Públicas",
  "Relaciones Laborales y Recursos Humanos",
  "Relaciones Internacionales",
  "Sociología",
  "Traducción e Interpretación",
  "Turismo",
  "Trabajo Social",
  "Educación Infantil",
  "Pedagogía",
  "Magisterio",
  "Educación Social",
  "Educación Primaria",

  // Ciencias de la Salud
  "Ciencias Biomédicas",
  "Ciencias de la Actividad Física y del Deporte",
  "Enfermería",
  "Farmacia",
  "Fisioterapia",
  "Logopedia",
  "Medicina",
  "Nutrición Humana y Dietética",
  "Odontología",
  "Óptica y Optometría",
  "Podología",
  "Psicología",
  "Terapia Ocupacional",
  "Veterinaria",

  // Ciencias Experimentales
  "Bioinformática",
  "Bioingeniería",
  "Biología",
  "Biomedicina",
  "Bioquímica",
  "Biotecnología",
  "Ciencia e Ingeniería de Datos",
  "Ciencia de los Alimentos",
  "Ciencias Ambientales",
  "Ciencias del Mar",
  "Estadística",
  "Física",
  "Geología",
  "Matemáticas",
  "Química",
  "Ciencias Actuariales y Financieras",

  // Arte y Humanidades
  "Animación",
  "Arqueología",
  "Arquitectura",
  "Arquitectura Naval",
  "Ingeniería Marítima",
  "Arte",
  "Bellas Artes",
  "Conservación y Restauración",
  "Diseño",
  "Diseño Gráfico",
  "Diseño de Interiores",
  "Diseño de Moda",
  "Estudios Ingleses",
  "Filología Clásica",
  "Filología Hispánica",
  "Historia y Ciencias de la Música",
  "Musicología",
  "Teoría de la Literatura",

  // Ingenierías
  "Arquitectura Técnica",
  "Edificación",
  "Ingeniería Aeroespacial",
  "Ingeniería Agroambiental",
  "Ingeniería Agrícola",
  "Ingeniería Agrónoma",
  "Ingeniería Alimentaria",
  "Ingeniería Biomédica",
  "Ingeniería Civil",
  "Ingeniería de Caminos",
  "Ingeniería de Materiales",
  "Ingeniería de Minas",
  "Ingeniería de Montes",
  "Ingeniería de Sistemas",
  "Ingeniería de Telecomunicación",
  "Ingeniería Electrónica",
  "Ingeniería Eléctrica",
  "Ingeniería en Energía",
  "Ingeniería Forestal",
  "Ingeniería Geológica",
  "Ingeniería Geomática",
  "Ingeniería Informática",
  "Ingeniería Industrial",
  "Ingeniería Mecánica",
  "Ingeniería Naval",
  "Ingeniería Nuclear",
  "Ingeniería Química",
  "Ingeniería en Organización Industrial",
  "Ingeniería en Tecnologías Industriales",
  "Diseño Industrial y Desarrollo del Producto",

  // Otras especialidades
  "Ciencias Náuticas",
  "Gestión Aeronáutica",
  "Logística",
  "Protocolo y Organización de Eventos",
  "Seguridad",
  "Ciencias del Transporte",
  "Estudios de Asia Oriental",
  "Estudios Árabes e Islámicos",
  "Estudios Hebreos y Arameos",
];

const yearOptions = [
  { value: "1", label: "1º Curso" },
  { value: "2", label: "2º Curso" },
  { value: "3", label: "3º Curso" },
  { value: "4", label: "4º Curso" },
  { value: "5", label: "5º Curso" },
  { value: "6", label: "6º Curso" },
  { value: "master", label: "Máster" },
  { value: "doctorado", label: "Doctorado" },
];

interface CustomProfilePageProps {
  bgColor: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export function CustomProfilePage({
  bgColor,
  setSidebarOpen,
}: CustomProfilePageProps) {
  const user = auth.currentUser;
  const { userStore } = useAuth();
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [universitySearch, setUniversitySearch] = useState(
    userStore?.studies?.uni || ""
  );
  const [majorSearch, setMajorSearch] = useState(
    userStore?.studies?.career || ""
  );
  const [showUniversityDropdown, setShowUniversityDropdown] = useState(false);
  const [showMajorDropdown, setShowMajorDropdown] = useState(false);
  const [formData, setFormData] = useState({
    name: userStore?.name || "",
    avatar: userStore?.profileImage || avatarOptions[0],
    university: userStore?.studies?.uni || "",
    major: userStore?.studies?.career || "",
    year: userStore?.studies?.year || "",
  });
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const { customProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setSidebarOpen(true);
  }, []);

  // Filtrar universidades basado en búsqueda
  const filteredUniversities = universities.filter(
    (uni) =>
      universitySearch === "" ||
      uni.toLowerCase().includes(universitySearch.toLowerCase())
  );

  // Filtrar carreras basado en búsqueda
  const filteredMajors = majors.filter(
    (major) =>
      majorSearch === "" ||
      major.toLowerCase().includes(majorSearch.toLowerCase())
  );

  const handleUniversitySelect = (university: string) => {
    setUniversitySearch(university);
    setFormData({ ...formData, university });
    setShowUniversityDropdown(false);
  };

  const handleMajorSelect = (major: string) => {
    setMajorSearch(major);
    setFormData({ ...formData, major });
    setShowMajorDropdown(false);
  };

  const handleSubmit = async () => {
    if (user && formData.name.trim()) {
      try {
        const studies: Studies = {
          uni: universitySearch,
          career: majorSearch || "",
          year: formData.year?.toString(),
        };
        await customProfile(formData.name, formData.avatar, studies);
        setShowSaveConfirmation(true);
        setTimeout(() => {
          setShowSaveConfirmation(false);
        }, 2000);
      } catch (error) {
        console.error("Error al actualizar: ", (error as Error).message);
      }
    }
  };

  return (
    <div
      className={` flex ${bgColor ? "bg-gradient-to-br from-blue-100 to-blue-300" : "bg-white"} p-4`}
    >
      <div
        className={`flex-1 p-8 pt-5 pb-6 max-w-xl m-auto ${bgColor ? "border-2 border-blue-300 rounded-2xl shadow-lg bg-white" : "border-2 border-gray-200 rounded-2xl"}`}
      >
        {/* Header minimalista */}
        <header className=" text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-1 tracking-tight">
            Personaliza tu Perfil
          </h1>
          <p className="text-gray-500 text-sm font-light leading-relaxed max-w-md mx-auto">
            Elige tu avatar y un nombre de usuario que te represente.
          </p>
        </header>

        <div className="space-y-4">
          {/* Avatar Section - Centrado y prominente */}
          <div className="text-center">
            <div className="relative inline-block mb-3">
              <div className="relative group">
                <div
                  className="w-20 h-20 cursor-pointer rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 shadow-md transition-all duration-300 group-hover:border-blue-300 group-hover:shadow-lg"
                  onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                >
                  {formData.avatar ? (
                    <img
                      src={formData.avatar}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm font-bold">
                      {formData.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Botón de cambiar avatar */}
                <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-all duration-200 shadow-md hover:scale-110">
                  <Camera className="w-3 h-3" />
                </button>
              </div>
            </div>

            <p className="text-gray-500 text-xs mb-4">
              Haz click para elegir otro avatar
            </p>

            {/* Avatar Picker - Grid elegante */}
            {showAvatarPicker && (
              <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 mb-4 animate-in fade-in-0 zoom-in-95 duration-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 text-center">
                  Elige tu avatar
                </h3>
                <div className="grid grid-cols-6 gap-2 max-w-sm mx-auto">
                  {avatarOptions.map((avatar, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setFormData({ ...formData, avatar });
                        setShowAvatarPicker(false);
                      }}
                      className={`relative w-10 h-10 rounded-full overflow-hidden transition-all duration-200 hover:scale-110 hover:shadow-md ${
                        formData.avatar === avatar
                          ? "ring-2 ring-blue-500 ring-offset-1 scale-105"
                          : "hover:ring-1 hover:ring-blue-300"
                      }`}
                    >
                      <img
                        src={avatar}
                        alt={`Avatar ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Form Fields - Espaciado generoso y limpio */}
          <div className="space-y-4">
            {/* Nombre de Usuario */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de Usuario
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-50 bg-white transition-all duration-200 focus:outline-none placeholder-gray-400"
                  placeholder="Tu nombre completo"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <User className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Universidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Universidad
              </label>
              <div
                className="relative"
                onBlur={() =>
                  setTimeout(() => setShowUniversityDropdown(false), 200)
                }
              >
                <input
                  type="text"
                  value={universitySearch}
                  onChange={(e) => {
                    setUniversitySearch(e.target.value);
                    setShowUniversityDropdown(true);
                  }}
                  onFocus={() => setShowUniversityDropdown(true)}
                  placeholder="Buscar por universidad..."
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-50 bg-white transition-all duration-200 focus:outline-none"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Search className="w-4 h-4 text-gray-400" />
                </div>

                {/* Dropdown de universidades */}
                {showUniversityDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 z-50 max-h-40 overflow-y-auto">
                    {filteredUniversities.length > 0 ? (
                      filteredUniversities.map((university) => (
                        <button
                          key={university}
                          onClick={() => handleUniversitySelect(university)}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors duration-150 first:rounded-t-xl last:rounded-b-xl"
                        >
                          {university}
                        </button>
                      ))
                    ) : (
                      <button
                        disabled
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-400"
                      >
                        No se encontraron universidades
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Carrera */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Carrera
              </label>
              <div
                className="relative"
                onBlur={() =>
                  setTimeout(() => setShowMajorDropdown(false), 200)
                }
              >
                <input
                  type="text"
                  value={majorSearch}
                  onChange={(e) => {
                    setMajorSearch(e.target.value);
                    setShowMajorDropdown(true);
                  }}
                  onFocus={() => setShowMajorDropdown(true)}
                  placeholder="Buscar carrera..."
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-50 bg-white transition-all duration-200 focus:outline-none"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Search className="w-4 h-4 text-gray-400" />
                </div>

                {/* Dropdown de carreras */}
                {showMajorDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 z-50 max-h-40 overflow-y-auto">
                    {filteredMajors.length > 0 ? (
                      filteredMajors.map((major) => (
                        <button
                          key={major}
                          onClick={() => handleMajorSelect(major)}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors duration-150 first:rounded-t-xl last:rounded-b-xl"
                        >
                          {major}
                        </button>
                      ))
                    ) : (
                      <button
                        disabled
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-400"
                      >
                        No se encontraron carreras
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Curso - mantener como select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Curso Académico
              </label>
              <div className="relative">
                <select
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({ ...formData, year: e.target.value })
                  }
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-50 bg-white transition-all duration-200 focus:outline-none appearance-none cursor-pointer"
                >
                  {yearOptions.map((year) => (
                    <option key={year.label} value={year.value}>
                      {year.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Botón de Guardar - Prominente y atractivo */}
          <div className="pt-4">
            <button
              onClick={handleSubmit}
              className="w-full py-3 bg-blue-500 text-white text-sm font-medium rounded-xl hover:bg-blue-600 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Perfil</span>
            </button>
          </div>
        </div>

        {/* Toast de confirmación */}
        {showSaveConfirmation && (
          <div className="fixed bottom-6 right-6 bg-green-500 text-white px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-300 z-50">
            <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
              <Check className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">
              Perfil actualizado correctamente
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

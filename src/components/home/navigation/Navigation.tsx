import { motion } from "framer-motion";
import {
  Wand2,
  FileText,
  GamepadIcon,
  Map,
  Home,
  Mic,
  Moon,
  Bell,
  Sun,
} from "lucide-react";
import { User } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { ProfileNavigation } from "./ProfileNavigation";
import Icon from "@mdi/react";
import { mdiEmoticonWink } from "@mdi/js";
import { User as MyUser, TabType } from "../../../types/global";
import { formatTokens } from "../../../utils/utils";
import { NavigationButton } from "./NavigationButton";
import { PlansButton } from "./PlansButton";
import { MobileButton } from "./MobileButton";
import { LoginButton } from "./LoginButton";
import { useAuth } from "../../../hooks/useAuth";
import { HiOutlineMicrophone } from "react-icons/hi";
import { active } from "d3";

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  user: User | null;
  userStore: MyUser | null;
  tokens: number;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  isDarkMode: boolean;
}

export function Navigation({
  activeTab,
  onTabChange,
  user,
  tokens,
  setDarkMode,
  isDarkMode,
}: NavigationProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogin = async () => {
    try {
      navigate("/login");
    } catch (error) {
      console.error("Error al entrar en login:", (error as Error).message);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      onTabChange("home");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <nav className="mb-6">
      <div
        className={`dark:bg-gray-900 bg-white w-full shadow-md dark:shadow-gray-800/50 py-4 px-4 flex items-center justify-between fixed top-0 left-0 right-0 z-50`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Icon
            path={mdiEmoticonWink}
            size={1.5}
            className="dark:text-blue-400 text-black"
            title="Logo"
          />
          <span className="text-xl font-bold dark:text-white text-gray-800">
            PerfectText
          </span>

          {activeTab === "voice" && (
            <button
              className="ml-2 fixed right-14 md:hidden"
              onClick={() => setDarkMode((prev) => !prev)}
            >
              {isDarkMode ? (
                <Sun className="text-blue-400" />
              ) : (
                <Moon className=" text-blue-600" />
              )}
            </button>
          )}
          <div className="md:hidden fixed right-0">
            {user ? (
              <ProfileNavigation
                photoURL={user.photoURL}
                name={user.displayName}
                tokens={formatTokens(tokens)}
                fromMobile
                handleLogout={handleLogout}
                setActiveTab={() => onTabChange("plans")}
              />
            ) : (
              <LoginButton handleLogin={handleLogin}></LoginButton>
            )}
          </div>
        </div>

        {/* Navegación para móviles */}
        <div
          className={`fixed bottom-0 left-0 right-0 dark:bg-gray-900 bg-white py-3 shadow-md dark:shadow-gray-800/50 flex justify-around items-center z-50 md:hidden`}
        >
          {!user && (
            <MobileButton
              onClick={() => onTabChange("home")}
              isActive={activeTab === "home"}
              text="Inicio"
            >
              <Home className="w-6 h-6" />
            </MobileButton>
          )}

          <MobileButton
            onClick={() => onTabChange("correct")}
            isActive={activeTab === "correct" || activeTab === "traductor"}
            text="Corrección"
          >
            <Wand2 className="w-6 h-6" />
          </MobileButton>

          <MobileButton
            onClick={() => onTabChange("quiz")}
            isActive={activeTab === "quiz"}
            text="Quiz"
          >
            <GamepadIcon className="w-6 h-6" />
          </MobileButton>

          <MobileButton
            onClick={() => onTabChange("conceptmap")}
            isActive={activeTab === "conceptmap"}
            text="Mapa"
          >
            <Map className="w-6 h-6" />
          </MobileButton>

          <MobileButton
            onClick={() => onTabChange("voice")}
            isActive={activeTab === "voice"}
            text="Voice"
          >
            <Mic className="w-6 h-6" />
          </MobileButton>
        </div>

        {/* Navegación para ordenador */}
        <div className="hidden md:flex flex-col md:flex-row items-center gap-2 absolute md:static w-full md:w-auto transition-transform duration-300">
          {!user && (
            <NavigationButton
              onClick={() => onTabChange("home")}
              isActive={activeTab === "home"}
              text="Inicio"
            >
              <Home className="w-6 h-6" />
            </NavigationButton>
          )}

          <NavigationButton
            onClick={() => onTabChange("correct")}
            isActive={activeTab === "correct" || activeTab === "traductor"}
            text="Corrección"
          >
            <Wand2 className="w-6 h-6" />
          </NavigationButton>

          <NavigationButton
            onClick={() => onTabChange("quiz")}
            isActive={activeTab === "quiz"}
            text="Quiz"
          >
            <GamepadIcon className="w-6 h-6" />
          </NavigationButton>

          <NavigationButton
            onClick={() => onTabChange("conceptmap")}
            isActive={activeTab === "conceptmap"}
            text="Mapa"
          >
            <Map className="w-6 h-6" />
          </NavigationButton>

          <NavigationButton
            onClick={() => onTabChange("voice")}
            isActive={activeTab === "voice"}
            text="Voice"
          >
            <HiOutlineMicrophone className="w-6 h-6" />
          </NavigationButton>

          {activeTab === "voice" && (
            <button
              className="ml-2"
              onClick={() => setDarkMode((prev) => !prev)}
            >
              {isDarkMode ? (
                <Sun className="text-blue-400" />
              ) : (
                <Moon className=" text-blue-600" />
              )}
            </button>
          )}

          {user ? (
            <ProfileNavigation
              photoURL={user.photoURL}
              name={user.displayName}
              tokens={formatTokens(tokens)}
              fromMobile={false}
              handleLogout={handleLogout}
              setActiveTab={() => onTabChange("plans")}

            />
          ) : (
            <LoginButton handleLogin={handleLogin}></LoginButton>
          )}
        </div>
      </div>
      <div className="pt-20"></div>
    </nav>
  );
}

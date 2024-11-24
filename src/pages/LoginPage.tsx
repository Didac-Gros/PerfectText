import React, { useState } from "react";
import { FcGoogle } from 'react-icons/fc'; // Icono de Google (de react-icons)
import { useNavigate } from "react-router-dom";
import { auth } from "../services/firebase"; // Configuración de Firebase
import { signInWithEmailAndPassword } from "firebase/auth";
import { RegisterInput } from "../components/register/RegisterInput";
import { HiOutlineMail } from "react-icons/hi";
import { FaRegEye } from "react-icons/fa6";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { GoogleButton } from "../components/register/GoogleButton";
import { FirebaseError } from "firebase/app";
import SubmitButton from "../components/register/SubmitButton";
import { FaArrowLeftLong } from "react-icons/fa6";

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      if (userCredential.user.emailVerified) {
        navigate("/");

      } else setError("Por favor, verifique su correo electrónico.");

    } catch (error) {
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case "auth/invalid-credential":
            setError("El usuario no existe.");
            return { success: false, message: "El usuario no existe." };

          case "auth/invalid-email":
            setError("Correo inválido.");
            return { success: false, message: "Correo inválido." };

          default:
            setError("Error inesperado.");
            return { success: false, message: "Error inesperado." };
        }
      } else
        console.error("Error al entrar en el registro: ", (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      navigate("/register");
    } catch (error) {
      console.error("Error al entrar en el registro: ", (error as Error).message);
    }
  };

  const handleHome = async () => {
    try {
      navigate("/");
    } catch (error) {
      console.error("Error al entrar en el registro: ", (error as Error).message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-gray-800 mb-5">
        <FaArrowLeftLong color="blue" size={"15px"}/>
        <a href="#" className="text-blue-500 hover:underline text-sm " onClick={handleHome}>
              Volver a la home
            </a>
        </div>


        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Bienvenido de nuevo</h2>
          <p className="text-gray-600">Continuemos su viaje de aprendizaje.</p>
        </div>

        <GoogleButton
          text="Iniciar sesión con Google">
        </GoogleButton>


        <div className="flex items-center justify-center my-4">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="relative bg-white px-4 text-gray-500">o continuar con</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>


        <form onSubmit={(e) => e.preventDefault()}>
          <RegisterInput
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<HiOutlineMail className="w-5 h-5" />}
          />

          <RegisterInput
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<FaRegEye className="w-5 h-5" />}
            password={true}
          />

          <div className="mb-6 text-right">
            <a href="#" className="text-blue-500 hover:underline">
              ¿Ha olvidado su contraseña?
            </a>
          </div>
          <p className="text-red-500 mb-4 text-xs">{error}</p>

          <SubmitButton onClick={handleLogin} isLoading={isLoading}></SubmitButton>

        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            ¿No tiene cuenta?{" "}
            <a href="#" className="text-blue-500 hover:underline" onClick={handleRegister}>
              Inscríbase
            </a>
          </p>
        </div>
      </div>
    </div >
  );
};

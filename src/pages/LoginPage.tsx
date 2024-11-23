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

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const validateEmail = (): boolean => {
    // Expresión regular para validar el correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (): boolean => {
    // Al menos 8 caracteres, una letra mayúscula, una minúscula, un número y un carácter especial
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const validateForm = (): boolean => {
    if (validateEmail() && validatePassword()) return true;

    if (!validateEmail()) {
      setError("Por favor, introduzca un correo electrónico válido.");
    }

    if (!validatePassword()) {
      setError(
        "La contraseña debe tener al menos 8 caracteres, incluyendo una letra mayúscula, una letra minúscula, un número y un carácter especial."
      );
    }

    return false;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (validateForm()) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        if (userCredential.user.emailVerified) {
          navigate("/");

        } else setError("Por favor, verifique su correo electrónico.");

      } catch (error) {
        console.error("Error al entrar en el registro: ", (error as Error).message);
      }


    }
  };

  const handleRegister = async () => {
    try {
      navigate("/register");
    } catch (error) {
      console.error("Error al entrar en el registro: ", (error as Error).message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Bienvenido de nuevo</h2>
          <p className="text-gray-600">Continuemos su viaje de aprendizaje.</p>
        </div>

        <GoogleButton
          text="Iniciar sesión con Google">
        </GoogleButton>


        <div className="relative text-center my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative bg-white px-4 text-gray-500">o continuar con</div>
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
          <button
            type="submit"
            onClick={handleLogin}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
          >
            →
          </button>
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
    </div>
  );
};

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../services/firestore/firebase"; // Configuración de Firebase
import { signInWithEmailAndPassword } from "firebase/auth";
import { RegisterInput } from "../components/register/RegisterInput";
import { HiOutlineMail } from "react-icons/hi";
import { FaRegEye } from "react-icons/fa6";
import { GoogleButton } from "../components/register/GoogleButton";
import { FirebaseError } from "firebase/app";
import { LoadingButton } from "../components/register/SubmitButton";
import { FaArrowLeftLong } from "react-icons/fa6";
import { motion } from "framer-motion";
import { getUserById } from "../services/firestore/userRepository";

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const handleLogin = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      if (userCredential.user.emailVerified) {
        const user = await getUserById(userCredential.user.uid);
        if (user?.profileImage) {
          const redirectTo = sessionStorage.getItem("invitation_link");
          console.log("Usuario ya existe, redirigiendo a:", redirectTo);
          if (redirectTo) {
            sessionStorage.removeItem("invitation_link");
            navigate(redirectTo);
          } else {
            navigate("/");
          }
        } else {
          navigate("/profile");
        }
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
        console.error(
          "Error al entrar en el registro: ",
          (error as Error).message
        );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      navigate("/register");
    } catch (error) {
      console.error(
        "Error al entrar en el registro: ",
        (error as Error).message
      );
    }
  };

  const handleHome = async () => {
    try {
      navigate("/");
    } catch (error) {
      console.error(
        "Error al entrar en el registro: ",
        (error as Error).message
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 p-6">
      <motion.div
        className="w-full max-w-md bg-white rounded-3xl shadow-xl p-10"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.div
          className="flex items-center gap-2 text-sm text-blue-500 hover:underline mb-6 cursor-pointer"
          onClick={handleHome}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <FaArrowLeftLong size={"15px"} />
          <span>Volver a la home</span>
        </motion.div>

        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-1">
            Bienvenido de nuevo
          </h2>
          <p className="text-sm text-gray-500">
            Continuemos su viaje de aprendizaje.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <GoogleButton text="Iniciar sesión con Google" />
        </motion.div>

        <motion.div
          className="flex items-center my-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <div className="flex-grow border-t border-gray-300" />
          <span className="mx-4 text-sm text-gray-400">o continuar con</span>
          <div className="flex-grow border-t border-gray-300" />
        </motion.div>

        <motion.form
          onSubmit={(e) => e.preventDefault()}
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
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

          <div className="text-right">
            <a href="#" className="text-blue-500 text-sm hover:underline">
              ¿Ha olvidado su contraseña?
            </a>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <LoadingButton onClick={handleLogin} isLoading={isLoading} />
        </motion.form>

        <motion.div
          className="mt-6 text-center text-sm text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          ¿No tiene cuenta?{" "}
          <a
            className="text-pink-500 font-semibold hover:underline cursor-pointer"
            onClick={handleRegister}
          >
            Inscríbase
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
};

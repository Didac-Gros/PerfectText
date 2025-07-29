import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "../services/firestore/firebase"; // Archivo de configuración de Firebase
import { RegisterInput } from "../components/register/RegisterInput";
import { FaArrowLeftLong, FaRegEye } from "react-icons/fa6";
import { HiOutlineMail } from "react-icons/hi";
import { GoogleButton } from "../components/register/GoogleButton";
import { LoadingButton } from "../components/register/SubmitButton";
import { FaRegUser } from "react-icons/fa";
import { addUserToFirestore } from "../services/firestore/firestore";
import { UserSubscription, User } from "../types/global";
import { motion } from "framer-motion";

export const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isVerificationSent, setIsVerificationSent] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const [usersCredential, setUsersCredential] = useState<any>(null);
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    return passwordRegex.test(password);
  };

  const validateForm = (password: string, email: string): boolean => {
    if (
      validateEmail(email) &&
      validatePassword(password) &&
      password === confirmPassword
    )
      return true;

    if (!validateEmail(email)) {
      setError("Por favor, introduzca un correo electrónico válido.");
    }

    if (!validatePassword(password)) {
      setError(
        "La contraseña debe tener al menos 8 caracteres, incluyendo una letra mayúscula, una letra minúscula, un número y un carácter especial."
      );
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
    }

    return false;
  };

  const handleRegister = async () => {
    setError(null);

    if (validateForm(password, email)) {
      setIsLoading(true);

      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        setUsersCredential(userCredential);

        const actionCodeSettings = {
          url: "https://perfecttext.ai/login", // ✅ cambia esto por tu ruta válida
          handleCodeInApp: false,
        };
        await sendEmailVerification(userCredential.user, actionCodeSettings);

        const newUser: User = {
          uid: userCredential.user.uid,
          name: name,
          email: email,
          subscription: UserSubscription.FREE,
          tokens: UserSubscription.TOKENSFREE as number,
          profileImage: "https://api.dicebear.com/6.x/pixel-art/svg?seed=user1",
          boardsCreated: false,
          customerId: null,
        };
        await addUserToFirestore(newUser);
        setIsVerificationSent(true);
        setIsLoading(false);
        handleLogin();
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  const handleLogin = async () => {
    try {
      navigate("/login");
    } catch (error) {
      console.error("Error al entrar en el login: ", (error as Error).message);
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

  if (isVerificationSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-3xl font-extrabold text-gray-800">
            Correo enviado
          </h2>
          <p className="text-gray-600">
            Se ha enviado un correo de verificación a <strong>{email}</strong>.
            Por favor, verifica tu correo antes de continuar.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="mt-4 bg-pink-500 text-white py-2 px-4 rounded-lg hover:bg-pink-600"
          >
            Ir al Login
          </button>
        </div>
      </div>
    );
  } else {
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
              Bienvenido a Perfect Text
            </h2>
            <p className="text-sm text-gray-500">
              Continuemos su viaje de aprendizaje.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <GoogleButton text="Registrarse con Google" />
          </motion.div>

          <motion.div
            className="flex items-center my-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex-grow border-t border-gray-300" />
            <span className="mx-4 text-sm text-gray-400">
              o registrarse con
            </span>
            <div className="flex-grow border-t border-gray-300" />
          </motion.div>

          <motion.div
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
              type="text"
              placeholder="Nombre de usuario"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={<FaRegUser className="w-5 h-4" />}
            />

            <RegisterInput
              type="password"
              placeholder="Introduzca su contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<FaRegEye className="w-5 h-5" />}
              password={true}
            />

            <RegisterInput
              type="password"
              placeholder="Confirme su contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={<FaRegEye className="w-5 h-5" />}
              password={true}
            />

            <p className="text-red-500 mb-4 text-xs">{error}</p>

            <LoadingButton onClick={handleRegister} isLoading={isLoading} />
          </motion.div>

          <motion.div
            className="mt-6 text-center text-sm text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            ¿Ya tiene cuenta?{" "}
            <a
              className="text-pink-500 font-semibold hover:underline cursor-pointer"
              onClick={handleLogin}
            >
              Inicia sesión
            </a>
          </motion.div>
        </motion.div>
      </div>
    );
  }
};

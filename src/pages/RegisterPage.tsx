import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc"; // Icono de Google (de react-icons)
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth } from "../services/firebase"; // Archivo de configuración de Firebase
import { RegisterInput } from "../components/register/RegisterInput"; // Importa el nuevo componente
import { FaRegEye } from "react-icons/fa6";
import { HiOutlineMail } from "react-icons/hi";
import { GoogleButton } from "../components/register/GoogleButton";

export const RegisterPage: React.FC = () => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [isVerificationSent, setIsVerificationSent] = useState<boolean>(false);
    const navigate = useNavigate();

    const validateEmail = (email: string): boolean => {
        // Expresión regular para validar el correo
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password: string): boolean => {
        // Al menos 8 caracteres, una letra mayúscula, una minúscula, un número y un carácter especial
        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        return passwordRegex.test(password);
    };

    const validateForm = (password: string, email: string): boolean => {
        if (validateEmail(email) && validatePassword(password) && password === confirmPassword) return true;

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

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (validateForm(password, email))
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);

                await sendEmailVerification(userCredential.user);
                setIsVerificationSent(true);
            } catch (err: any) {
                setError(err.message);
            }
    };

    const handleLogin = async () => {
        try {
            navigate("/login");
        } catch (error) {
            console.error("Error al entrar en el login: ", (error as Error).message);
        }
    };


    if (isVerificationSent) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 text-center">
                    <h2 className="text-2xl font-bold text-gray-800">Correo enviado</h2>
                    <p className="text-gray-600">
                        Se ha enviado un correo de verificación a <strong>{email}</strong>.
                        Por favor, verifica tu correo antes de continuar.
                    </p>
                    <button
                        onClick={() => navigate("/login")} // Redirigir al login después de la verificación
                        className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
                    >
                        Ir al Login
                    </button>
                </div>
            </div>
        );
    }
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Bienvenido a Perfect Text
                    </h2>
                    <p className="text-gray-600">Continuemos su viaje de aprendizaje.</p>
                </div>

                <GoogleButton
                    text="Registrarse con Google">
                </GoogleButton>

                <div className="relative text-center my-4">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative bg-white px-4 text-gray-500">
                        o registrarse con
                    </div>
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

                    <button
                        type="submit"
                        onClick={handleRegister}
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
                    >
                        →
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-600">
                        ¿Ya tiene cuenta?{" "}
                        <a href="#" className="text-blue-500 hover:underline" onClick={handleLogin}>
                            Inicia sesión
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

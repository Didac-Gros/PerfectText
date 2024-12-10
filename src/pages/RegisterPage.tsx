import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth";
import { auth } from "../services/firebase"; // Archivo de configuración de Firebase
import { RegisterInput } from "../components/register/RegisterInput";
import { FaArrowLeftLong, FaRegEye } from "react-icons/fa6";
import { HiOutlineMail } from "react-icons/hi";
import { GoogleButton } from "../components/register/GoogleButton";
import SubmitButton from "../components/register/SubmitButton";
import { FaRegUser } from "react-icons/fa";
import { addUserToFirestore } from "../services/firestore";
import { UserSubscription, User } from "../types/global";

export const RegisterPage: React.FC = () => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [name, setName] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [isVerificationSent, setIsVerificationSent] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const navigate = useNavigate();

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

        if (validateForm(password, email)) {
            setIsLoading(true);

            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);

                await sendEmailVerification(userCredential.user);
                setIsVerificationSent(true);

                const newUser: User = {
                    uid: userCredential.user.uid,
                    name: name,
                    email: email,
                    subscription: UserSubscription.FREE,
                    tokens: UserSubscription.TOKENSFREE as number,
                };
                await addUserToFirestore(newUser);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
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
            console.error("Error al entrar en el registro: ", (error as Error).message);
        }
    };

    if (isVerificationSent) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-500 to-pink-500">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
                    <h2 className="text-3xl font-extrabold text-gray-800">Correo enviado</h2>
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
    }
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-500 to-pink-500">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center gap-2 mb-5">
                    <FaArrowLeftLong
                        color="blue"
                        size="20px"
                        className="cursor-pointer hover:text-pink-600"
                        onClick={handleHome}
                    />
                    <span className="text-gray-800 font-semibold">Volver a la home</span>
                </div>
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-extrabold text-gray-800">
                        Bienvenido a Perfect Text
                    </h2>
                    <p className="text-gray-600">Continuemos su viaje de aprendizaje.</p>
                </div>

                <GoogleButton
                    text="Registrarse con Google">
                </GoogleButton>

                <div className="flex items-center justify-center my-4">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="relative bg-white px-4 text-gray-500">o registrarse con</span>
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

                    <SubmitButton onClick={handleRegister} isLoading={isLoading}></SubmitButton>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-600">
                        ¿Ya tiene cuenta?{" "}
                        <a href="#" className="text-pink-500 font-bold hover:underline" onClick={handleLogin}>
                            Inicia sesión
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

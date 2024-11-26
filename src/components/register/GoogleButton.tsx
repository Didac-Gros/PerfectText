import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../services/firebase";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";

interface GoogleButtonProps {
    text: string;
}

export const GoogleButton: React.FC<GoogleButtonProps> = ({
    text
}) => {
    const navigate = useNavigate();

    const handleGoogleRegister = async () => {
        const provider = new GoogleAuthProvider();

        try {
            await signInWithPopup(auth, provider);
            (auth.currentUser?.metadata.creationTime === auth.currentUser?.metadata.lastSignInTime) ? navigate("/profile") : navigate("/");

        } catch (error: any) {
            console.error("Error al iniciar sesión con Google:", error.message);
        }
    }
    return (
        <button className="flex items-center justify-center w-full bg-black text-white py-2 px-4 rounded-lg mb-6 hover:bg-gray-800 space-x-2" onClick={handleGoogleRegister}>
            <FcGoogle className="w-5 h-5" />
            <span>{text}</span>
        </button>
    )
};

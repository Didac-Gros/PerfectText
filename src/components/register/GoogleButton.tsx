import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../services/firebase";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { User, UserSubscription } from "../../types/global";
import { findUserByEmail } from "../../services/firestore";

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
            // Inicia sesión con Google
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
    
            if (user) {    
                // Comprueba si el usuario ya existe
                const userExists = await findUserByEmail(user.email!);
    
                if (!userExists) {
                    // Crea un nuevo usuario
                    const newUser: User = {
                        uid: user.uid,
                        name: user.displayName!,
                        email: user.email!,
                        subscription: UserSubscription.FREE,
                        tokens: UserSubscription.TOKENSFREE as number,
                    };
                    // addUserToFirestore(newUser)
                    // .then(() => console.log("Usuario añadido a Firestore:", newUser))
                    // .catch((error) => console.error("Error añadiendo usuario a Firestore:", error));
    
                    // Navega al perfil
                    navigate("/profile");
                } else {
                    // Si el usuario ya existe, navega al inicio
                    navigate("/");
                }
            }
        } catch (error: any) {
            console.error("Error al iniciar sesión con Google:", error.message);
        }
    };
    
    return (
        <button className="flex items-center justify-center w-full bg-black text-white py-2 px-4 rounded-lg mb-6 hover:bg-gray-800 space-x-2" onClick={handleGoogleRegister}>
            <FcGoogle className="w-5 h-5" />
            <span>{text}</span>
        </button>
    )
};

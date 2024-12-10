import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup } from "firebase/auth";
import { auth } from "../../services/firebase";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { User, UserSubscription } from "../../types/global";
import { addUserToFirestore, findUserByEmail } from "../../services/firestore";

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
            const unsubscribe = onAuthStateChanged(auth, async (user) => {
                if (user) {
                    console.log("Usuario de Google:", user);
                    const userExists = await findUserByEmail(user.email!);
                    if (!userExists) {
                        const newUser: User = {
                            uid: user.uid,
                            name: user.displayName!,
                            email: user.email!,
                            subscription: UserSubscription.FREE,
                            tokens: UserSubscription.TOKENSFREE as number,
                        };
                        await addUserToFirestore(newUser);
                        console.log("Usuario de firestore:", newUser);
                        navigate("/profile");
                    } else {
                        navigate("/");
                    }

                    unsubscribe(); // Limpia el listener
                }
            });

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

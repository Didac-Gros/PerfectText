import React, { createContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signOut,
  updateProfile,
  User,
} from "firebase/auth";
import { auth } from "../services/firestore/firebase"; // Configuración de Firebase
import {
  addUserToFirestore,
  findUserByEmail,
  updateFirestoreField,
} from "../services/firestore/firestore"; // Importar la función
import { ReactNode } from "react";
import { User as MyUser, Studies, UserSubscription } from "../types/global";
import { Timestamp } from "firebase/firestore";

interface AuthContextProps {
  user: User | null; // Usuario autenticado de Firebase
  userStore: MyUser | null; // Datos adicionales del usuario en Firestore
  loading: boolean; // Estado de carga
  logout: () => Promise<void>; // Función para cerrar sesión
  customProfile: (name: string, selectedAvatar: string, studies: Studies) => Promise<void>; // Función para actualizar el perfil
}

export const AuthContext = createContext<AuthContextProps>({
  user: null,
  userStore: null,
  loading: true,
  logout: async () => {},
  customProfile: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null); // Usuario autenticado
  const [userStore, setuserStore] = useState<MyUser | null>(null); // Usuario de Firestore
  const [loading, setLoading] = useState<boolean>(true); // Estado de carga

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true); // Inicia el estado de carga

      if (currentUser) {
        setUser(currentUser); // Establece el usuario autenticado

        try {
          // Busca al usuario en Firestore
          const firestoreUserData = await findUserByEmail(currentUser.email!);
          const oneMonthFromNow = new Date();
          oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
          if (firestoreUserData) {
            // Tipar los datos al modelo de `User`
            const formattedUser: MyUser = {
              uid: currentUser.uid,
              customerId: firestoreUserData.customerId,
              expirationDate: Timestamp.fromDate(oneMonthFromNow),
              name: firestoreUserData.name,
              email: firestoreUserData.email,
              subscription: firestoreUserData.subscription,
              tokens: firestoreUserData.tokens,
              profileImage: firestoreUserData.profileImage,
              boardsCreated: firestoreUserData.boardsCreated,
            };

            setuserStore(formattedUser); // Actualiza el estado con los datos del usuario de Firestore
          } else {
            const formattedUser: MyUser = {
              uid: currentUser.uid,
              customerId: null,
              expirationDate: Timestamp.fromDate(oneMonthFromNow),
              name: currentUser.displayName!,
              email: currentUser.email!,
              subscription: UserSubscription.FREE,
              tokens: UserSubscription.TOKENSFREE as number,
              profileImage: currentUser.photoURL!,
              boardsCreated: false,
            };
            await addUserToFirestore(formattedUser); // Agrega al usuario en Firestore
            setuserStore(formattedUser); // Si no se encuentra el usuario, establece null
          }
        } catch (error) {
          console.error("Error al obtener el usuario de Firestore:", error);
          setuserStore(null); // Si ocurre un error, limpia el estado de Firestore
        }
      } else {
        setUser(null);
        setuserStore(null); // Limpia los datos si no hay un usuario autenticado
      }

      setLoading(false); // Finaliza el estado de carga
    });

    return () => unsubscribe(); // Limpia el listener cuando el componente se desmonta
  }, []);

  const logout = async () => {
    try {
      await signOut(auth); // Cierra la sesión en Firebase
      setUser(null); // Limpia el estado del usuario autenticado
      setuserStore(null); // Limpia el estado del usuario de Firestore
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const customProfile = async (name: string, selectedAvatar: string, studies: Studies) => {
    try {
      // Actualiza el estado del usuario de Firestore
      setuserStore((prev) => ({
        ...prev!,
        name,
        profileImage: selectedAvatar,
      }));
      await updateProfile(user!, {
        displayName: name,
        photoURL: selectedAvatar || undefined,
      });
      await updateFirestoreField("users", user!.uid, "name", name);
      await updateFirestoreField(
        "users",
        user!.uid,
        "profileImage",
        selectedAvatar
      );
      await updateFirestoreField(
        "users",
        user!.uid,
        "studies",
        studies
      );
      
    } catch (error) {
      console.error("Error al personalizar perfil:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, userStore, loading, logout, customProfile }}
    >
      {loading ? <p>Cargando...</p> : children}
    </AuthContext.Provider>
  );
};

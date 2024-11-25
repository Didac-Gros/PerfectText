import React, { createContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "../services/firebase"; // Configuración de Firebase
import { ReactNode } from "react";

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>; // Añadimos la función logout
}

export const AuthContext = createContext<AuthContextProps>({
  user: null,
  loading: true,
  logout: async () => { },
});


interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Establece el usuario actual
      setLoading(false); // Cambia el estado de carga a false
    });

    return () => unsubscribe(); // Limpia el listener cuando el componente se desmonta
  }, []);

  const logout = async () => {
    try {
      await signOut(auth); // Cierra la sesión en Firebase
      setUser(null); // Limpia el estado del usuario en el contexto
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {loading ? <p>Cargando...</p> : children}
    </AuthContext.Provider>
  );
};

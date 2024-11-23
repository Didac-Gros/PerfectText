import React, { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../services/firebase"; // Configuración de Firebase

export const AuthContext = React.createContext<{
  user: User | null;
  loading: boolean;
}>({ user: null, loading: true });

import { ReactNode } from "react";

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

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {loading ? <p>Cargando...</p> : children}
    </AuthContext.Provider>
  );
};

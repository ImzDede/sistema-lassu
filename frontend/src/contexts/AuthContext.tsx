"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { TokenPayload } from "@/types/usuarios";
import { verifyUserRedirect } from "@/utils/auth"; 
import api from "@/services/api";

// Estendemos o tipo para incluir dados que podem vir do /profile
interface UserData extends TokenPayload {
  fotoUrl?: string | null;
  matricula?: number;
  email?: string;
}

interface AuthContextType {
  user: UserData | null;
  isLoading: boolean;
  isTeacher: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const initAuth = async () => {
      // Usa sua função verifyUserRedirect para checar cookie/rota instantaneamente
      const userFromToken = verifyUserRedirect(router, pathname);

      // Se a função retornou null, ela já redirecionou pro login.
      if (!userFromToken) {
        if (pathname === "/") setIsLoading(false);
        return;
      }

      // Carrega os dados do token na hora
      setUser((prev) => ({ ...prev, ...userFromToken }));
      setIsLoading(false);

      // Busca dados frescos do servidor
      try {
        const response = await api.get("/users/profile");
        
        if (response.data.user) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.error("Erro ao validar sessão no servidor:", error);
      }
    };

    initAuth();
  }, [pathname, router]);

  const isTeacher = !!user?.permAdmin;

  return (
    <AuthContext.Provider value={{ user, isLoading, isTeacher }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

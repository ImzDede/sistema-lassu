"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { destroyCookie, parseCookies } from "nookies";
import { User, LoginDTO } from "@/types/usuarios";
import { authService } from "@/services/authServices";
import { saveToken } from "@/utils/auth";

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isTeacher: boolean;
  signIn: (data: LoginDTO) => Promise<void>;
  signOut: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Função auxiliar para normalizar o usuário vindo da API
  const normalizeUser = (data: any): User => {
    return data.user ? data.user : data;
  };

  // 1. Carga inicial
  useEffect(() => {
    const { "lassu.token": token } = parseCookies();

    if (token) {
      authService
        .getProfile()
        .then((response) => {
          const userData = normalizeUser(response);
          setUser(userData);
        })
        .catch(() => {
          signOut();
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  // 2. Login
  async function signIn({ email, senha }: LoginDTO) {
    try {
      const response = await authService.login({ email, senha });
      const { token } = response;
      
      // Normaliza o usuário que vem no login
      const userResponse = normalizeUser(response);

      saveToken(token);
      setUser(userResponse);

      if (userResponse.primeiroAcesso) {
        router.push("/primeiroAcesso");
      } else {
        router.push("/home");
      }
    } catch (error) {
      throw error;
    }
  }

  // 3. Logout
  function signOut() {
    destroyCookie(null, "lassu.token");
    setUser(null);
    router.push("/");
  }

  // 4. Atualizar perfil
  async function refreshProfile() {
    try {
      const response = await authService.getProfile();
      setUser(normalizeUser(response));
    } catch (error) {
      console.error("Erro ao atualizar perfil", error);
    }
  }

  const isTeacher = !!(user?.permAdmin || user?.permCadastro || user?.permAtendimento);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isTeacher,
        signIn,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { destroyCookie, parseCookies, setCookie } from "nookies";
import { User, LoginDTO } from "@/types/usuarios";
import { authService } from "@/services/authServices";
import { saveToken } from "@/utils/auth";
import api from "@/services/apiServices";

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isTeacher: boolean;
  signIn: (data: LoginDTO) => Promise<void>;
  signOut: () => void;
  refreshProfile: () => Promise<void>;
  validateSession: () => Promise<void>;
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

  // 1. Carga inicial: Recupera sessão dos cookies ao recarregar a página
  useEffect(() => {
    const { "lassu.token": token } = parseCookies();

    if (token) {
      // Configura header imediatamente ao carregar a página para evitar 401
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      
      authService
        .getProfile()
        .then((response) => {
          const userData = normalizeUser(response);
          setUser(userData);
        })
        .catch((err) => {
          console.error("Erro ao carregar sessão:", err);
          signOut(); // Se o token for inválido, limpa tudo
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  // 2. Login: Autentica o usuário e salva o estado
  async function signIn({ email, senha }: LoginDTO) {
    setIsLoading(true); // Bloqueia a UI para evitar cliques duplos
    try {
      console.log("Iniciando autenticação...");
      const response = await authService.login({ email, senha });
      const { token } = response;
      
      const userResponse = normalizeUser(response);

      // A. Salva Token nos Cookies
      saveToken(token);
      
      // B. Configura Header Global do Axios para as próximas requisições
      api.defaults.headers["Authorization"] = `Bearer ${token}`;

      // C. Atualiza Estado da Aplicação
      setUser(userResponse);

      console.log("Login sucesso. Redirecionando...");

      // D. Redirecionamento Baseado no Perfil
      if (userResponse.primeiroAcesso) {
        router.push("/primeiroAcesso");
      } else {
        router.push("/home");
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  // 3. Logout: Limpa cookies, estado e cabeçalhos
  function signOut() {
    destroyCookie(null, "lassu.token");
    setUser(null);
    delete api.defaults.headers["Authorization"];
    router.push("/");
  }

  // 4. Atualizar Perfil: Busca dados atualizados do usuário (ex: após editar perfil)
  async function refreshProfile() {
    try {
      const response = await authService.getProfile();
      setUser(normalizeUser(response));
    } catch (error) {
      console.error("Erro ao atualizar perfil", error);
    }
  }

  // 5. Validar Sessão: Verifica periodicamente se o usuário ainda está ativo e com as permissões certas
  async function validateSession() {
      if (!user) return;
      try {
          const response = await authService.getProfile();
          const remoteUser = normalizeUser(response);
          
          if (remoteUser.ativo === false) {
              console.warn("Usuário desativado. Encerrando sessão.");
              signOut();
              return;
          }

          // Se as permissões mudaram
          if (
              remoteUser.permAdmin !== user.permAdmin || 
              remoteUser.permCadastro !== user.permCadastro ||
              remoteUser.permAtendimento !== user.permAtendimento
          ) {
              console.log("🔄 Permissões alteradas detectadas. Iniciando refresh do token...");
              
              // 1. Obtém novo token do backend
              const { token: newToken } = await authService.refreshToken();
              
              if (newToken) {
                  // 2. Atualiza o Cookie PRIMEIRO
                  saveToken(newToken);
                  
                  // 3. Atualiza o Header da instância atual do Axios em todos os locais possíveis
                  api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
                  api.defaults.headers['Authorization'] = `Bearer ${newToken}`;
                  
                  // 4. Atualiza o estado do usuário no React
                  setUser(remoteUser);
                  
                  console.log("Token atualizado com sucesso. Permissões sincronizadas.");
              }
          }

      } catch (error: any) {
          console.error("Erro na validação de sessão:", error);
          // Apenas desloga se for erro de autenticação (401)
          if (error.response?.status === 401) {
              signOut();
          }
      }
  }

  // Efeito que roda a validação toda vez que o usuário muda de rota
  useEffect(() => {
      if(user) {
          validateSession();
      }
  }, [pathname]); 

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
        validateSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

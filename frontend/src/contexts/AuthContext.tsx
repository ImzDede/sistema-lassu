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
    setIsLoading(true);
    try {
      // 1. Faz o login para pegar o token (o user daqui vem incompleto)
      const loginResponse = await authService.login({ email, senha });
      const { token } = loginResponse;

      // 2. Salva o token e configura o header IMEDIATAMENTE
      saveToken(token);
      api.defaults.headers["Authorization"] = `Bearer ${token}`;

      // 3. Busca o perfil completo (que tem as permissões certas)
      const userProfile = await authService.getProfile();
      const fullUser = normalizeUser(userProfile);

      // 4. Salva o usuário completo no estado
      setUser(fullUser);

      // 5. Redirecionamento
      if (fullUser.primeiroAcesso) {
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

      // Função auxiliar local: Converte qualquer bagunça para true ou false
      const safeBool = (val: any): boolean => {
          if (val === true || val === "true" || val === 1 || val === "1") return true;
          return false;
      };

      try {
          const response = await authService.getProfile();
          const remoteUser = normalizeUser(response);
          
          // 1. Se foi desativado no banco, tchau.
          if (remoteUser.ativo === false) {
              console.warn("Usuário desativado. Encerrando sessão.");
              signOut();
              return;
          }

          // 2. Comparação segura
          const adminMudou = safeBool(remoteUser.permAdmin) !== safeBool(user.permAdmin);
          const cadMudou = safeBool(remoteUser.permCadastro) !== safeBool(user.permCadastro);
          const atendMudou = safeBool(remoteUser.permAtendimento) !== safeBool(user.permAtendimento);

          // Só desloga se realmente houve mudança lógica
          if (adminMudou || cadMudou || atendMudou) {
              console.warn("Divergência real de permissão detectada. Sincronizando...");
              
              // DEBUG: Descomente se o erro persistir para ver o que está comparando
              
              signOut();
          }

      } catch (error: any) {
          // Se o token expirou ou é inválido (401), aí sim desloga
          if (error.response?.status === 401) signOut();
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

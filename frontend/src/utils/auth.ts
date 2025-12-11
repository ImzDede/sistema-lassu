import { destroyCookie, parseCookies, setCookie } from "nookies";
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "@/types/usuarios";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

const TOKEN_KEY = "lassuauth.token";

export function getToken() {
  const cookies = parseCookies();
  return cookies[TOKEN_KEY];
}

export function saveToken(token: string, keepConnected: boolean = false) {
  const cookieOptions: any = { path: "/" };
  if (keepConnected) cookieOptions.maxAge = 60 * 60 * 24 * 7; 
  
  setCookie(undefined, TOKEN_KEY, token, cookieOptions);
}

export function logout() {
  destroyCookie(undefined, TOKEN_KEY, { path: "/" });
  destroyCookie(undefined, "primeiroAcesso", { path: "/" });
  if (typeof window !== "undefined") {
    window.location.href = "/";
  }
}

export function getUserFromToken(): TokenPayload | null {
  const token = getToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode<TokenPayload>(token);
    
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      logout();
      return null;
    }

    return decoded;
  } catch (error) {
    return null;
  }
}

export function verifyUserRedirect(router: AppRouterInstance, pathname: string) {
  const user = getUserFromToken();

  // 1. Se NÃO tem usuário e tenta acessar página interna
  if (!user) {
    if (pathname !== "/") {
      router.push("/");
      return null;
    }
  }

  // 2. Se TEM usuário
  if (user) {
    // CASO A: Usuário acessando a tela de Login
    if (pathname === "/") {
      if (user.primeiroAcesso) {
         router.push("/primeiroAcesso");
      } else {
         router.push("/home");
      }
    }

    // CASO B: BLINDAGEM DO PRIMEIRO ACESSO
    // Se o usuário DEVE fazer o primeiro acesso, mas está tentando ir para /home...
    if (user.primeiroAcesso && pathname.startsWith("/home")) {
        router.push("/primeiroAcesso");
    }

    // CASO C: BLINDAGEM INVERSA
    // Se o usuário JÁ FEZ o primeiro acesso, mas tenta voltar manualmente para /primeiroAcesso...
    if (!user.primeiroAcesso && pathname.startsWith("/primeiroAcesso")) {
        router.push("/home");
    }
  }

  return user;
}
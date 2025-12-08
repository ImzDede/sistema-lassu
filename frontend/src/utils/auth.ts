import { destroyCookie, parseCookies, setCookie } from "nookies";
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "@/types/usuarios";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

const TOKEN_KEY = "lassuauth.token";

// Pega o token
export function getToken() {
  const cookies = parseCookies();
  return cookies[TOKEN_KEY];
}

// Salva o token
export function saveToken(token: string, keepConnected: boolean = false) {
  const cookieOptions: any = { path: "/" };
  if (keepConnected) {
    cookieOptions.maxAge = 60 * 60 * 24 * 7;
  }
  setCookie(undefined, TOKEN_KEY, token, cookieOptions);
}

// Desloga o usuário
export function logout() {
  destroyCookie(undefined, TOKEN_KEY, { path: "/" });
  if (typeof window !== "undefined") {
    window.location.href = "/";
  }
}

// Decodifica o token para recuperar os dados do usuário (se válido)
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

// Essa função verifica onde o usuário está e para onde ele deveria ir
export function verifyUserRedirect(router: AppRouterInstance, currentPath: string) {
  const user = getUserFromToken();

  if (!user) {
    if (currentPath !== "/") {
      router.push("/");
    }
    return null;
  }

  if (user.primeiroAcesso) {
    if (currentPath !== "/primeiroAcesso") {
      router.push("/primeiroAcesso");
    }
    return user;
  }

  if (!user.primeiroAcesso) {
    if (currentPath === "/primeiroAcesso" || currentPath === "/") {
      router.push("/home");
    }
    return user;
  }

  return user;
}
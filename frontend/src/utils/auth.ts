import { destroyCookie, parseCookies, setCookie } from "nookies";
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "@/types/usuarios";

const TOKEN_KEY = "lassu.token";

export function saveToken(token: string, keepConnected: boolean = false) {
  const maxAge = keepConnected ? 60 * 60 * 24 * 7 : 60 * 60 * 24;
  setCookie(undefined, TOKEN_KEY, token, {
    maxAge,
    path: "/",
  });
}

export function getToken(): string | undefined {
  const cookies = parseCookies();
  return cookies[TOKEN_KEY];
}

export function logout() {
  destroyCookie(undefined, TOKEN_KEY, { path: "/" });
  if (typeof window !== "undefined") {
    window.location.href = "/";
  }
}

// Verifica validade do token (Decode + Expiração)
export function getDecodedToken(): TokenPayload | null {
  const token = getToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode<TokenPayload>(token);
    const currentTime = Date.now() / 1000;
    
    if (decoded.exp && decoded.exp < currentTime) {
      logout(); // Token expirado
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}

export function verifyUserRedirect(router: any, pathname: string): TokenPayload | null {
  const user = getDecodedToken();

  // Se não tem usuário ou token expirou, getDecodedToken já retorna null (e faz logout se expirou)
  if (!user) return null;

  const isFirstAccess = user.primeiroAcesso;

  // Regra A: Se é Primeiro Acesso, SÓ pode ficar na tela de /primeiroAcesso
  if (isFirstAccess) {
    if (!pathname.startsWith("/primeiroAcesso")) {
      router.replace("/primeiroAcesso");
    }
    return user;
  }

  // Regra B: Se NÃO é Primeiro Acesso (usuário normal)
  // Não pode acessar /primeiroAcesso e nem ficar na tela de Login (/)
  if (!isFirstAccess) {
    if (pathname.startsWith("/primeiroAcesso") || pathname === "/") {
      router.replace("/home");
    }
  }

  return user;
}
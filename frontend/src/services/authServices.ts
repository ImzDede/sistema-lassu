import api from "./apiServices";
import {
  LoginDTO,
  LoginResponse,
  UpdatePasswordDTO,
  UpdateProfileDTO,
  User,
} from "@/types/usuarios";

export const authService = {
  // Login
  async login(data: LoginDTO): Promise<LoginResponse> {
    const response = await api.post("/users/login", data);
    return response.data.data || response.data;
  },

  // Busca dados do usuário logado (Meu Perfil)
  async getProfile(): Promise<User> {
    const response = await api.get("/users/profile");
    return response.data.data || response.data;
  },

  // Atualiza dados cadastrais
  async updateProfile(data: Partial<UpdateProfileDTO>): Promise<User> {
    const response = await api.put("/users/profile", data);
    return response.data.data || response.data;
  },

  // Troca de senha
  async updatePassword(data: UpdatePasswordDTO): Promise<void> {
    await api.patch("/users/profile/password", data);
  },

  // Finaliza o fluxo de Primeiro Acesso
  async completeFirstAccess(senha: string, disponibilidade: any[]): Promise<{ token: string }> {
    const response = await api.patch("/users/first-access", { senha, disponibilidade });
    return response.data.data || response.data;
  },
};
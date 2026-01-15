import { useState, useCallback } from "react";
import { userService } from "@/services/userServices";
import { User } from "@/types/usuarios";

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Busca lista de terapeutas
  const fetchUsers = useCallback(async (filters?: { page?: number; limit?: number; ativo?: boolean; nome?: string }) => {
    setLoading(true);
    try {
      let ativoParam: 'true' | 'false' | undefined = undefined;
      if (filters?.ativo === true) ativoParam = 'true';
      if (filters?.ativo === false) ativoParam = 'false';

      const response = await userService.getAllTherapists({
        page: filters?.page || 1,
        limit: filters?.limit || 8,
        ativo: ativoParam,
        orderBy: 'nome',
        nome: filters?.nome
      });

      setUsers(response.data || []);
      setError(null);
      
      return response.meta;
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar usuários.");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Alias para compatibilidade com código legado
  const refreshUsers = useCallback(() => fetchUsers(), [fetchUsers]);

  // Busca um usuário específico pelo ID
  const getUserById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      return await userService.getById(id);
    } finally { 
      setLoading(false); 
    }
  }, []);

  // Atualiza as permissões de um usuário
  const updatePermissions = useCallback(async (id: string, perms: Partial<User>) => {
    try {
      const updated = await userService.updatePermissions(id, perms);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      return updated;
    } catch (error) { throw error; }
  }, []);

  // Alterna o status (Ativo/Inativo) de um usuário
  const toggleStatus = useCallback(async (id: string, currentStatus: boolean) => {
    try {
      const updated = await userService.update(id, { ativo: !currentStatus });
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      return updated;
    } catch (error) { throw error; }
  }, []);

  return {
    users,
    loading,
    error,
    refreshUsers,
    fetchUsers,
    getUserById,
    updatePermissions,
    toggleStatus,
  };
}

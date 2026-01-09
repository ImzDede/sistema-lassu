import { useState, useCallback } from "react";
import { userService } from "@/services/userServices";
import { User } from "@/types/usuarios";

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await userService.getAllTherapists();
      setUsers(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar usuários.");
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserById = async (id: string) => {
    try {
      setLoading(true);
      const user = await userService.getById(id);
      return user;
    } finally {
      setLoading(false);
    }
  };

  const updatePermissions = async (id: string, perms: Partial<User>) => {
    try {
      const updated = await userService.updatePermissions(id, perms);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      return updated;
    } catch (error) {
      throw error;
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const updated = await userService.update(id, { ativo: !currentStatus });
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      return updated;
    } catch (error) {
      throw error;
    }
  };

  return {
    users,
    loading,
    error,
    refreshUsers,
    fetchUsers: refreshUsers,
    getUserById,
    updatePermissions,
    toggleStatus,
  };
}

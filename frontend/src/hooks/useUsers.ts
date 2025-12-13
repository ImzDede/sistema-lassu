import { useState, useCallback } from "react";
import api from "@/services/api";

export function useUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // LISTAR USUÁRIOS (GET /users)
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/users");
      setUsers(response.data); 
    } catch (err) {
      setError("Erro ao buscar usuários.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Retorna os dados
  const getUserById = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const response = await api.get(`/users/${id}`);
      return response.data; 
    } catch (err) {
      console.error("Erro ao buscar usuário", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ATUALIZAR USUÁRIO (PUT /users)
  const updateUser = useCallback(async (id: string, data: any) => {
    setLoading(true);
    try {
      await api.put(`/users/${id}`, data);
      
      setUsers((prev) => 
        prev.map((item) => {
            if (item.user && item.user.id === id) {
                return { ...item, user: { ...item.user, ...data } };
            }

            if (item.id === id) {
                return { ...item, ...data };
            }
            return item;
        })
      );
      
      return true;
    } catch (err) {
      console.error("Erro ao atualizar usuário", err);
      setError("Erro ao atualizar usuário.");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // DELETE LÓGICO 
  const deleteUser = useCallback(async (id: string) => {
    return await updateUser(id, { ativo: false });
  }, [updateUser]);

  return {
    users,
    loading,
    error,
    fetchUsers,
    getUserById,
    updateUser,
    deleteUser
  };
}
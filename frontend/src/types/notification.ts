export interface Notification {
  id: number;
  usuarioId: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  createdAt: string;
}
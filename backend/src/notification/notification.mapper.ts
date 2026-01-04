import { NotificationIdListResponseDTO, NotificationIdRow, NotificationListResponseDTO, NotificationRow } from "./notification.type";

export class NotificationMapper {
  static toList(data: { notificationRows: NotificationRow[] }): NotificationListResponseDTO {
    const { notificationRows } = data
    return {
      notifications: notificationRows.map((notificationRow) => {
        return {
          id: notificationRow.id,
          titulo: notificationRow.titulo,
          mensagem: notificationRow.mensagem,
          lida: notificationRow.lida,
          createdAt: notificationRow.created_at
        }
      })
    }
  }

  static toIdList(data: { notificationRows: NotificationIdRow[] }): NotificationIdListResponseDTO {
    const { notificationRows } = data
    let ids: number[] = []
    for (const notificationRow of notificationRows) {
      ids.push(notificationRow.id)
    }
    return {
      ids: ids
    }
  }
}

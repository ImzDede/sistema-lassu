import { UserRepository } from "../user/user.repository";
import { Notification } from "./notification.messages";
import { NotificationRepository } from "./notification.repository";
import { NotificationIdArrayDTO, NotificationListDTO } from "./notification.schema";

const repository = new NotificationRepository()
const userRepository = new UserRepository()

export class NotificationService {

    async notifyUser(userId: string, data: Notification) {
        await repository.create(userId, data.title, data.message)
    }

    async notifyAdmins(data: Notification) {
        const admins = await userRepository.findAdmins();

        await Promise.all(
            admins.map(admin =>
                repository.create(admin.id, data.title, data.message)
            )
        );
    }

    async listByUser(userId: string, params: NotificationListDTO) {
        const { page, limit, orderBy, direction, lida } = params;
        const offset = (page - 1) * limit;

        const ativoBoolean = lida === 'true' ? true : (lida === 'false' ? false : undefined);

        const { notificationRows, total } = await repository.listByUser(
            userId,
            {
                limit,
                offset,
                orderBy,
                direction,
                lida: ativoBoolean
            });

        const totalPages = Math.ceil(total / limit);

        return {
            notificationRows,
            totalItems: total,
            totalPages: totalPages,
            currentPage: page,
            itemsPerPage: limit,
            sortBy: orderBy,
            sortDirection: direction,
            filterActive: ativoBoolean
        };
    }

    async markAsRead(userId: string, data: NotificationIdArrayDTO) {
        const notificationRows = await repository.markAsRead(userId, data.ids)
        return {
            notificationRows,
            count: notificationRows.length
        }
    }

    async delete(userId: string, data: NotificationIdArrayDTO) {
        const notificationRows = await repository.delete(userId, data.ids)
        return {
            notificationRows,
            count: notificationRows.length
        }
    }

}
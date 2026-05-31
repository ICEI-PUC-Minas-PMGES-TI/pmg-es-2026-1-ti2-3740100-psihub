import { useCallback, useEffect, useState } from 'react';
import { notificationApi } from '@/services/notification.service.js';

// TODO: move to a dedicated notifications module if this cross-role domain grows.
export function useNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAll = useCallback((signal) => {
        setLoading(true);
        return notificationApi.listNotifications({ signal })
            .then((data) => {
                setNotifications(data || []);
            })
            .catch((err) => {
                if (err.name !== 'AbortError') {
                    // silently ignore â€” notification errors must not crash the app
                }
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        fetchAll(controller.signal);
        return () => controller.abort();
    }, [fetchAll]);

    const refresh = useCallback(() => {
        const controller = new AbortController();
        fetchAll(controller.signal);
    }, [fetchAll]);

    const markAsRead = useCallback(async (id) => {
        try {
            const updated = await notificationApi.markNotificationRead(id);
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, lida: true, ...updated } : n))
            );
        } catch {
            // silently ignore
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            await notificationApi.markAllNotificationsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, lida: true })));
        } catch {
            // silently ignore
        }
    }, []);

    const unreadCount = notifications.filter((n) => !n.lida).length;

    return { notifications, unreadCount, loading, markAsRead, markAllAsRead, refresh };
}

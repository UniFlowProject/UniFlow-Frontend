import type { NotificationsCountResponseDto } from '@/api/notifications';
import { env } from '@/env';
import { useAuthStore } from '@/stores/auth';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export interface SocketNotification {
  id: { value: string }
  userId: { value: string }
  title: string
  message: string
  type: { value: string }
  priority: { value: string }
  isRead: boolean
  createdAt: string
  readAt: any
  taskId: string
  subjectId: string
  actionUrl: any
  scheduledFor: any
}

const WS_URL = env.VITE_NOTIFICATIONS_WEB_APP_URL || 'wss://9x02s2lrsg.execute-api.us-east-1.amazonaws.com/dev/';
const MAX_RECONNECT_DELAY = 30_000;

// API Gateway pushes raw frames (no event names), so accept either the
// notification itself or an envelope like { event, data }.
const parseNotification = (raw: unknown): SocketNotification | null => {
  if (typeof raw !== 'string') return null;
  try {
    const msg = JSON.parse(raw);
    const payload = msg?.data ?? msg?.payload ?? msg;
    return payload?.title && payload?.id ? payload : null;
  } catch {
    return null;
  }
};

export const usePushNotifications = (userId: string | null) => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const isAuthenticated = useAuthStore(state => !!state.authToken);

  useEffect(() => {
    if (!userId || !isAuthenticated) return;

    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;
    let disposed = false;

    const handleNotification = (notification: SocketNotification) => {
      console.log('📬 Nueva notificación:', notification);

      // 1️⃣ Invalidar queries para actualizar la lista
      qc.invalidateQueries({ queryKey: ['notifications', userId] });
      qc.setQueryData(
        ['notifications', 'unreadCount'],
        (old: NotificationsCountResponseDto) => ({ ...old, unreadCount: (old?.unreadCount || 0) + 1 })
      );

      // 2️⃣ Mostrar toast en la app
      toast.info(notification.title, {
        description: notification.message,
        duration: 5000,
        action: notification.actionUrl ? {
          label: 'Ver',
          onClick: () => {
            navigate({ to: notification.actionUrl! });
          },
        } : undefined,
      });

      // 3️⃣ Mostrar notificación nativa del navegador
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/android-chrome-192x192.png',
          tag: notification.id.value, // Evita duplicados
        });
      } else if (Notification.permission === 'default') {
        // Pedir permiso solo la primera vez
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(notification.title, {
              body: notification.message,
              icon: '/android-chrome-192x192.png',
            });
          }
        });
      }
    };

    const connect = async () => {
      const token = await useAuthStore.getState().getValidAccessToken();
      if (!token || disposed) return;

      const url = new URL(WS_URL);
      url.searchParams.set('token', token);
      ws = new WebSocket(url);

      ws.onopen = () => {
        console.log('✅ WebSocket conectado');
        attempts = 0;
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        const notification = parseNotification(event.data);
        if (notification) handleNotification(notification);
      };

      ws.onerror = (error) => console.error('WebSocket error:', error);

      ws.onclose = () => {
        console.log('❌ WebSocket desconectado');
        setIsConnected(false);
        ws = null;
        if (disposed) return;
        // API Gateway corta conexiones ociosas (10 min) y a las 2 h: reconectar
        const delay = Math.min(1000 * 2 ** attempts++, MAX_RECONNECT_DELAY);
        reconnectTimer = setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      console.log('🧹 Limpiando socket...');
      disposed = true;
      clearTimeout(reconnectTimer);
      ws?.close();
    };
  }, [userId, isAuthenticated, navigate, qc]);

  return {
    isConnected
  };
};

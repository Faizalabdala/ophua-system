export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  metadata: string | NotificationMetadata | null;
  createdAt: string;
}

export type NotificationType =
  | "ORDER_CREATED"
  | "STATUS_CHANGED"
  | "ORDER_ASSIGNED"
  | "PAYMENT_UPDATED"
  | "ORDER_UPDATED"
  | "SYSTEM";

export interface NotificationMetadata {
  orderId?: string;
  status?: string;
  paymentStatus?: string;
  customerName?: string;
  createdBy?: string;
  changedBy?: string;
  updatedBy?: string;
  timestamp?: string;
  [key: string]: any;
}

export interface NotificationsResponse {
  notifications: Notification[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  unreadCount: number;
}

export interface UnreadCountResponse {
  count: number;
}

// Helper para parsear metadata
export const parseNotificationMetadata = (
  metadata: string | NotificationMetadata | null
): NotificationMetadata | null => {
  if (!metadata) return null;
  if (typeof metadata === "string") {
    try {
      return JSON.parse(metadata);
    } catch {
      return null;
    }
  }
  return metadata;
};

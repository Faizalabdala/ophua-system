// src/types/Notification.js
export const NotificationType = {
  ORDER_CREATED: 'ORDER_CREATED',
  STATUS_CHANGED: 'STATUS_CHANGED',
  PAYMENT_UPDATED: 'PAYMENT_UPDATED',
  ORDER_ASSIGNED: 'ORDER_ASSIGNED',
  ORDER_UPDATED: 'ORDER_UPDATED',
  SYSTEM: 'SYSTEM',
};

export const parseNotificationMetadata = (metadataString) => {
  try {
    if (!metadataString) return null;
    return JSON.parse(metadataString);
  } catch (error) {
    console.error('Erro ao parsear metadata:', error);
    return null;
  }
};

export const NotificationStatus = {
  UNREAD: 'UNREAD',
  READ: 'READ',
};
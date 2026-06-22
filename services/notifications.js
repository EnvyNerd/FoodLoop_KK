// In-memory notification store for FoodLoop
// No real push notifications — purely in-app for prototype

let notifications = [];
let nextId = 1;

export function addNotification({ userId, title, message, type }) {
  const n = {
    id: String(nextId++),
    userId: userId || 'all',
    title,
    message,
    type,
    read: false,
    createdAt: new Date().toISOString(),
  };
  notifications.unshift(n);
  return n;
}

export function getNotifications(userId) {
  if (userId) {
    return notifications.filter(n => n.userId === userId || n.userId === 'all');
  }
  return [...notifications];
}

export function markAsRead(notifId) {
  const n = notifications.find(x => x.id === notifId);
  if (n) n.read = true;
}

export function markAllAsRead(userId) {
  notifications.forEach(n => {
    if (n.userId === userId || n.userId === 'all') n.read = true;
  });
}

export function getUnreadCount(userId) {
  return notifications.filter(n => !n.read && (n.userId === userId || n.userId === 'all')).length;
}

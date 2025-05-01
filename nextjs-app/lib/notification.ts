"use client";
export type NotificationType = "success" | "error" | "warning";

export interface Notification {
  message: string;
  type: NotificationType;
}

export const Notify = (notification: Notification) => {
  const { message } = notification;

  if (notification.type === "success") {
    console.log(message);
  } else if (notification.type === "error") {
    console.error(message);
  } else if (notification.type === "warning") {
    console.warn(message);
  }

  alert(message);
};

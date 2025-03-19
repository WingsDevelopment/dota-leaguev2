"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModalProps extends React.ComponentPropsWithoutRef<typeof Dialog.Root> {}

export const Modal = ({ children, ...props }: ModalProps) => {
  return <Dialog.Root {...props}>{children}</Dialog.Root>;
};

export const ModalTrigger = Dialog.Trigger;

export const ModalContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof Dialog.Content>
>(({ className, children, ...props }, ref) => {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <Dialog.Content
        ref={ref}
        className={cn(
          "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-[90%] max-w-md",
          className
        )}
        {...props}
      >
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  );
});
ModalContent.displayName = "ModalContent";

export const ModalHeader = ({ children }: { children: React.ReactNode }) => {
  return <div className="text-lg font-bold mb-2">{children}</div>;
};

export const ModalDescription = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex flex-col gap-2">{children}</div>; // Adds spacing between buttons
};

export const ModalFooter = ({ children }: { children: React.ReactNode }) => {
  return <div className="mt-4 flex justify-end">{children}</div>;
};

export const ModalButtonGroup = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex flex-wrap gap-2 justify-center">{children}</div>; // Ensures buttons are aligned
};

export const ModalClose = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof Dialog.Close>) => {
  return (
    <Dialog.Close className={cn("absolute top-2 right-2", className)} {...props}>
      <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
    </Dialog.Close>
  );
};

import React, { createContext, useContext } from "react";
import { Toaster } from "@/components/ui/toaster";
import { useToast as useShadToast } from "@/hooks/use-toast";

export interface ToastContextType {
  show: (message: string, options?: { type: "success" | "error" | "warning" | "info" }) => void;
  showToast: (title: string, message: string, type: "success" | "error" | "warning" | "info") => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useShadToast();

  const show = (message: string, options?: { type: "success" | "error" | "warning" | "info" }) => {
    toast({
      title: message,
      variant: options?.type === "error" ? "destructive" : "default",
      // @ts-ignore: extending with customVariant
      customVariant: options?.type ?? "info"
    });
  };

  const showToast = (title: string, message: string, type: "success" | "error" | "warning" | "info") => {
    toast({
      title,
      description: message,
      variant: type === "error" ? "destructive" : "default",
      // @ts-ignore: extending with customVariant
      customVariant: type
    });
  };

  return (
    <ToastContext.Provider value={{ show, showToast }}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

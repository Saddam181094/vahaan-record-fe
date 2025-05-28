// lib/hooks/useAppToast.ts
import { toast } from "sonner";

export const useAppToast = () => {
  const success = (message: string, description?: string) =>
    toast(description ? `${message}: ${description}` : message);

  const error = (message: string, description?: string) =>
    toast(description ? `${message}: ${description}` : message);

  return { success, error };
};

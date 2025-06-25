import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

import { cn } from "@/lib/utils" // optional helper for merging class names

const toastStyles: Record<string, string> = {
  success: "bg-green-100 text-green-800 border-green-300",
  error: "bg-red-100 text-red-800 border-red-300",
  warning: "bg-yellow-100 text-yellow-800 border-yellow-300",
  info: "bg-blue-100 text-blue-800 border-blue-300",
}

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, variant = "info", ...props }) => {
        const resolvedVariant = (props as any).customVariant ?? variant;
        const style = toastStyles[resolvedVariant as keyof typeof toastStyles] || toastStyles["info"];


        return (
          <Toast
            key={id}
            {...props}
            className={cn(
              "border rounded-md shadow-sm px-4 py-3 w-full max-w-md flex items-center justify-between space-x-2",
              style
            )}
          >
            <div className="flex flex-col text-sm">
              {title && <ToastTitle className="font-semibold">{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
<ToastViewport className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] w-full max-w-lg px-4 flex flex-col items-center" />
    </ToastProvider>
  )
}

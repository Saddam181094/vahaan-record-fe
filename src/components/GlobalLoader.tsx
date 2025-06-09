import { useLoading } from "@/components/LoadingContext";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils"; // if using shadcn
import { motion } from "framer-motion";

export default function GlobalLoader() {
  const { isLoading } = useLoading();

  return (
    <div
      className={cn(
        "fixed inset-0 z-[9999] bg-black/30 flex items-center justify-center min-h-[100vh] transition-opacity",
        isLoading ? "visible opacity-100" : "invisible opacity-0"
      )}
    >
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
        <Loader2 className="h-10 w-10 text-white animate-spin" />
      </motion.div>
    </div>
  );
}

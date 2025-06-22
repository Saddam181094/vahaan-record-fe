import { useLoading } from "@/components/LoadingContext";
import { Loader2 } from "lucide-react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function GlobalLoader() {
  const { isLoading } = useLoading();

  return createPortal(
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="global-loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999]  bg-[#5156DB]/30 flex items-center justify-center"
        >
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
            <Loader2 className="h-10 w-10 text-white" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

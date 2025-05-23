import { Loader2 } from "lucide-react";
import React from "react";

interface LoaderProps {
  isLoading: boolean;
}

const Loader: React.FC<LoaderProps> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-white bg-opacity-50">
      <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
    </div>
  );
};

export default Loader;

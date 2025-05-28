// components/DialogProvider.tsx
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DialogContextType {
  showDialog: (options: { title: string; description?: string; content?: React.ReactNode }) => void;
  hideDialog: () => void;
}

const DialogContext = React.createContext<DialogContextType | undefined>(undefined);

export const useDialog = () => {
  const context = React.useContext(DialogContext);
  if (!context) {
    throw new Error("useDialog must be used within a DialogProvider");
  }
  return context;
};

export const DialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState<string | undefined>();
  const [customContent, setCustomContent] = React.useState<React.ReactNode>(null);

  const showDialog = ({
    title,
    description,
    content,
  }: {
    title: string;
    description?: string;
    content?: React.ReactNode;
  }) => {
    setTitle(title);
    setDescription(description);
    setCustomContent(content ?? null);
    setOpen(true);
  };

  const hideDialog = () => {
    setOpen(false);
  };

  return (
    <DialogContext.Provider value={{ showDialog, hideDialog }}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
          {customContent}
        </DialogContent>
      </Dialog>
    </DialogContext.Provider>
  );
};

"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { UploadForm } from "./UploadForm";

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UploadModal({ open, onOpenChange }: UploadModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 animate-fade-slide-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-bg-secondary p-6 animate-fade-slide-in">
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-h3 text-text-primary">Upload track</Dialog.Title>
            <Dialog.Close className="text-text-muted hover:text-text-primary">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>
          <UploadForm onDone={() => onOpenChange(false)} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateGroup } from "@/hooks/useGroups";

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateGroupDialog({ open, onOpenChange }: CreateGroupDialogProps) {
  const [name, setName] = useState("");
  const createGroup = useCreateGroup();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createGroup.mutate(name.trim(), {
      onSuccess: () => {
        toast.success("Group created");
        setName("");
        onOpenChange(false);
      },
      onError: () => toast.error("Couldn't create group"),
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 animate-fade-slide-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-bg-secondary p-6 animate-fade-slide-in">
          <Dialog.Title className="text-h3 text-text-primary">New group</Dialog.Title>
          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <Input
              autoFocus
              placeholder="Group name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <Dialog.Close asChild>
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button type="submit" disabled={!name.trim() || createGroup.isPending}>
                Create
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

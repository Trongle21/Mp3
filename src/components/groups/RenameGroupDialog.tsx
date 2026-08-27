"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";
import type { Group } from "@/interfaces/group.interface";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRenameGroup } from "@/hooks/useGroups";

interface RenameGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: Group;
}

export function RenameGroupDialog({ open, onOpenChange, group }: RenameGroupDialogProps) {
  const [name, setName] = useState(group.name);
  const rename = useRenameGroup(group._id);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-bg-secondary p-6">
          <Dialog.Title className="text-h3 text-text-primary">Rename group</Dialog.Title>
          <form
            className="mt-4 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              rename.mutate(name, {
                onSuccess: () => {
                  toast.success("Group renamed");
                  onOpenChange(false);
                },
                onError: () => toast.error("Couldn't rename group"),
              });
            }}
          >
            <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} />
            <div className="flex justify-end gap-3">
              <Dialog.Close asChild>
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button type="submit" disabled={!name.trim()}>
                Save
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

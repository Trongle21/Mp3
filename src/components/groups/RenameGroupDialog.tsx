'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRenameGroupDialog } from '@/hooks';
import type { IGroup } from '@/interfaces';
import * as Dialog from '@radix-ui/react-dialog';

export interface IRenameGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: IGroup;
}

export function RenameGroupDialog(props: IRenameGroupDialogProps) {
  const { open, onOpenChange } = props;

  const { handleSubmit, isSubmitting, name, setName } =
    useRenameGroupDialog(props);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={onOpenChange}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 animate-fade-slide-in" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-bg-secondary p-6 animate-fade-slide-in mx-4"
          style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
        >
          <Dialog.Title className="text-h3 text-text-primary">
            Rename Group
          </Dialog.Title>
          <form
            className="mt-4 space-y-4"
            onSubmit={handleSubmit}
          >
            <Input
              autoFocus
              placeholder="Group name *"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <Dialog.Close asChild>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </Dialog.Close>
              <Button
                type="submit"
                disabled={!name.trim() || isSubmitting}
              >
                {isSubmitting ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

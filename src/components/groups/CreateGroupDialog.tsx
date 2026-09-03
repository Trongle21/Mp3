'use client';

import { ImagePicker } from '@/components/shared/ImagePicker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateGroupDialog } from '@/hooks';
import * as Dialog from '@radix-ui/react-dialog';

export interface ICreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateGroupDialog(props: ICreateGroupDialogProps) {
  const { open, onOpenChange } = props;

  const {
    handleSubmit,
    isSubmitting,
    name,
    setName,
    thumbnailFile,
    setThumbnailFile,
  } = useCreateGroupDialog(props);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={onOpenChange}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 animate-fade-slide-in" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-bg-secondary p-6 animate-fade-slide-in mx-4 max-h-[90vh] overflow-y-auto"
          style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
        >
          <Dialog.Title className="text-h3 text-text-primary">
            New Group
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
            <ImagePicker
              file={thumbnailFile}
              onChange={setThumbnailFile}
              label="Cover image (optional)"
              disabled={isSubmitting}
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
                {isSubmitting ? 'Creating…' : 'Create'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

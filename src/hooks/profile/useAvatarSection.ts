import type { IAvatarSectionProps } from '@/components';
import { useRef } from 'react';
import { toast } from 'sonner';

export function useAvatarSection(props: IAvatarSectionProps) {
  const { handleUploadAvatar } = props;

  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    try {
      await handleUploadAvatar(file);
    } catch {
      // error handled by hook
    }
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return {
    inputRef,
    handleFileChange,
  };
}

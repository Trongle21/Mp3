import type { IEditUserModalProps } from '@/components';
import { useState } from 'react';

export const useEditUserModal = (props: IEditUserModalProps) => {
  const { user, onClose, onSave, onSubmit } = props;

  const [form, setForm] = useState({
    name: user.name ?? '',
    birthdate: user.birthdate ? user.birthdate.split('T')[0] : '',
    gender: user.gender ?? '',
  });

  const handleSave = async () => {
    await onSubmit({
      userId: user._id,
      name: form.name,
      birthdate: form.birthdate,
      gender: form.gender,
    });
    onSave({
      ...user,
      ...form,
      birthdate: form.birthdate || null,
      gender: (form.gender || null) as 'male' | 'female' | 'other' | null,
    });
    onClose();
  };

  return {
    form,
    handleSave,
    setForm,
  };
};

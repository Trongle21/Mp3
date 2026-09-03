import type { IProfileFormProps } from '@/components';
import type { IUpdateMeBody } from '@/interfaces';
import { useState, useEffect } from 'react';

export const useProfileForm = (props: IProfileFormProps) => {
  const { user, handleUpdateProfile } = props;
  const [name, setName] = useState(user.name);
  const [birthdate, setBirthdate] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | null>(
    user.gender
  );
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (user.birthdate) {
      setBirthdate(user.birthdate.split('T')[0]);
    } else {
      setBirthdate('');
    }
  }, [user.birthdate]);

  const handleNameChange = (v: string) => {
    setName(v);
    setDirty(
      v.trim() !== user.name ||
        birthdate !== (user.birthdate?.split('T')[0] ?? '') ||
        gender !== user.gender
    );
  };

  const handleBirthdateChange = (v: string) => {
    setBirthdate(v);
    setDirty(
      name.trim() !== user.name ||
        v !== (user.birthdate?.split('T')[0] ?? '') ||
        gender !== user.gender
    );
  };

  const handleGenderChange = (v: 'male' | 'female' | 'other' | null) => {
    setGender(v);
    setDirty(
      name.trim() !== user.name ||
        birthdate !== (user.birthdate?.split('T')[0] ?? '') ||
        v !== user.gender
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      return;
    }

    const body: IUpdateMeBody = {
      name: trimmedName,
      birthdate: birthdate || null,
      gender,
    };

    await handleUpdateProfile(body);
    setDirty(false);
  };

  return {
    dirty,
    handleSubmit,
    name,
    handleNameChange,
    birthdate,
    handleBirthdateChange,
    gender,
    handleGenderChange,
  };
};

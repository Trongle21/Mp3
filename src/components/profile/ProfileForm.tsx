'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProfileForm } from '@/hooks';
import type { IUpdateMeBody, IUser } from '@/interfaces';
import { Save } from 'lucide-react';

export interface IProfileFormProps {
  user: IUser;
  handleUpdateProfile: (body: IUpdateMeBody) => void;
  isSaving?: boolean;
}

const genderOptions: {
  label: string;
  value: 'male' | 'female' | 'other' | null;
}[] = [
  { label: 'Unspecified', value: null },
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
];

export function ProfileForm(props: IProfileFormProps) {
  const { user, isSaving } = props;

  const {
    dirty,
    handleSubmit,
    name,
    handleNameChange,
    birthdate,
    handleBirthdateChange,
    gender,
    handleGenderChange,
  } = useProfileForm(props);

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5"
    >
      <div className="flex flex-col gap-1.5">
        <label className="text-caption font-medium text-text-secondary">
          Email
        </label>
        <Input
          value={user.email}
          readOnly
          disabled
          className="cursor-not-allowed opacity-60"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-caption font-medium text-text-secondary">
          Display name
        </label>
        <Input
          value={name}
          onChange={e => handleNameChange(e.target.value)}
          maxLength={200}
          placeholder="Your display name"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-caption font-medium text-text-secondary">
          Date of birth
        </label>
        <Input
          type="date"
          value={birthdate}
          onChange={e => handleBirthdateChange(e.target.value)}
          className="[color-scheme:dark]"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-caption font-medium text-text-secondary">
          Gender
        </label>
        <select
          value={gender ?? ''}
          onChange={e =>
            handleGenderChange(
              (e.target.value || null) as 'male' | 'female' | 'other' | null
            )
          }
          className="h-11 w-full rounded-md border border-border bg-bg-elevated px-3 text-body text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {genderOptions.map(opt => (
            <option
              key={opt.label}
              value={opt.value ?? ''}
            >
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {dirty && (
        <Button
          type="submit"
          disabled={isSaving}
          className="self-start"
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save changes'}
        </Button>
      )}
    </form>
  );
}

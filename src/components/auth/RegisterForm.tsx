'use client';

import { AppButton, AppInput } from '@/components';
import { useRegisterForm } from '@/hooks';
import Link from 'next/link';
import { Controller } from 'react-hook-form';

export function RegisterForm() {
  const { form, handleSubmit, isPending } = useRegisterForm();

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 space-y-4"
    >
      <Controller
        control={form.control}
        name="name"
        render={({ field, fieldState: { error } }) => (
          <AppInput
            placeholder="Name (optional)"
            error={error?.message}
            {...field}
          />
        )}
      />

      <Controller
        control={form.control}
        name="email"
        render={({ field, fieldState: { error } }) => (
          <AppInput
            placeholder="Email"
            error={error?.message}
            {...field}
          />
        )}
      />

      <Controller
        control={form.control}
        name="password"
        render={({ field, fieldState: { error } }) => (
          <AppInput
            placeholder="Password (min 8 characters)"
            error={error?.message}
            type="password"
            {...field}
          />
        )}
      />

      <Controller
        control={form.control}
        name="confirmPassword"
        render={({ field, fieldState: { error } }) => (
          <AppInput
            placeholder="Password (min 8 characters)"
            error={error?.message}
            type="password"
            {...field}
          />
        )}
      />

      <AppButton
        type="submit"
        className="w-full"
        disabled={isPending}
      >
        {isPending ? 'Creating account…' : 'Create account'}
      </AppButton>

      <p className="pt-2 text-center text-caption text-text-secondary">
        Already have an account?{' '}
        <Link
          href="/login"
          className="text-accent hover:text-accent-hover"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}

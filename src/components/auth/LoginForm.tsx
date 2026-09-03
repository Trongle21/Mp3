'use client';

import { useLoginForm } from '@/hooks';
import Link from 'next/link';
import { Controller } from 'react-hook-form';
import { AppButton, AppInput } from '../ui';

export function LoginForm() {
  const { form, handleSubmit, isPending } = useLoginForm();

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 space-y-4"
    >
      <Controller
        control={form.control}
        name="email"
        render={({ field, fieldState: { error } }) => (
          <AppInput
            placeholder="Email"
            type="email"
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
            placeholder="Password"
            type="password"
            error={error?.message}
            {...field}
          />
        )}
      />

      <AppButton
        type="submit"
        className="w-full"
        disabled={isPending}
      >
        {isPending ? 'Logging in…' : 'Log in'}
      </AppButton>

      <p className="pt-2 text-center text-caption text-text-secondary">
        New here?{' '}
        <Link
          href="/register"
          className="text-accent hover:text-accent-hover"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}

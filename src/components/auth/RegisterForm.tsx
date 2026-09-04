'use client';

import { AppButton, AppInput } from '@/components';
import { useRegisterForm } from '@/hooks';
import { EyeIcon, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { Controller } from 'react-hook-form';

export function RegisterForm() {
  const {
    form,
    handleSubmit,
    isPending,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
  } = useRegisterForm();

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
            type={showPassword ? 'text' : 'password'}
            suffixIcon={
              showPassword ? (
                <button
                  type="button"
                  className="cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <EyeIcon />
                </button>
              ) : (
                <button
                  type="button"
                  className="cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <EyeOff />
                </button>
              )
            }
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
            type={showConfirmPassword ? 'text' : 'password'}
            suffixIcon={
              showConfirmPassword ? (
                <button
                  type="button"
                  className="cursor-pointer"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <EyeIcon />
                </button>
              ) : (
                <button
                  type="button"
                  className="cursor-pointer"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <EyeOff />
                </button>
              )
            }
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

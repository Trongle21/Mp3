"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/types/auth.schema";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { isAxiosError } from "axios";

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginInput) => {
    setServerError(null);
    setIsSubmitting(true);
    try {
      await login(values.email, values.password);
      router.push("/library");
    } catch (err) {
      if (isAxiosError(err) && err.response?.data) {
        const body = err.response.data;
        if (body.errors) {
          body.errors.forEach((fieldError: { field: string; message: string }) => {
            setError(fieldError.field as keyof LoginInput, { message: fieldError.message });
          });
        } else {
          setServerError(body.message ?? "Something went wrong. Try again.");
        }
      } else {
        setServerError("Something went wrong. Try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
      <Input placeholder="Email" type="email" {...register("email")} error={errors.email?.message} />
      <Input
        placeholder="Password"
        type="password"
        {...register("password")}
        error={errors.password?.message}
      />

      <label className="flex items-center gap-2 text-caption text-text-secondary">
        <input type="checkbox" {...register("rememberMe")} className="accent-accent" />
        Remember me
      </label>

      {serverError && <p className="text-caption text-danger">{serverError}</p>}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Logging in…" : "Log in"}
      </Button>

      <div className="flex items-center gap-3 py-2">
        <div className="h-px flex-1 bg-border" />
        <span className="text-caption text-text-muted">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="space-y-2">
        <Button type="button" variant="outline" className="w-full">
          Continue with Google
        </Button>
        <Button type="button" variant="outline" className="w-full">
          Continue with GitHub
        </Button>
      </div>

      <p className="pt-2 text-center text-caption text-text-secondary">
        New here?{" "}
        <Link href="/register" className="text-accent hover:text-accent-hover">
          Create an account
        </Link>
      </p>
    </form>
  );
}

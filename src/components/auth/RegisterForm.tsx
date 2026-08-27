"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { registerSchema, type RegisterInput } from "@/types/auth.schema";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function RegisterForm() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values: RegisterInput) => {
    setServerError(null);
    setIsSubmitting(true);
    try {
      await registerUser(values.email, values.password, values.name);
      router.push("/library");
    } catch (err) {
      if (isAxiosError(err) && err.response?.data) {
        const body = err.response.data;
        if (body.errors) {
          body.errors.forEach((fieldError: { field: string; message: string }) => {
            setError(fieldError.field as keyof RegisterInput, { message: fieldError.message });
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
      <Input placeholder="Name (optional)" {...register("name")} error={errors.name?.message} />
      <Input placeholder="Email" type="email" {...register("email")} error={errors.email?.message} />
      <Input
        placeholder="Password (min 8 characters)"
        type="password"
        {...register("password")}
        error={errors.password?.message}
      />

      {serverError && <p className="text-caption text-danger">{serverError}</p>}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Creating account…" : "Create account"}
      </Button>

      <p className="pt-2 text-center text-caption text-text-secondary">
        Already have an account?{" "}
        <Link href="/login" className="text-accent hover:text-accent-hover">
          Log in
        </Link>
      </p>
    </form>
  );
}

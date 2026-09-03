'use client';

import { useAuth } from '@/hooks';
import type { ILoginBody } from '@/interfaces';
import { useLoginMutation } from '@/services';
import { loginSchema, type TLoginSchema } from '@/validations';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

const defaultValues = {
  email: '',
  password: '',
};

export const useLoginForm = () => {
  const router = useRouter();
  const { login } = useAuth();

  const form = useForm<TLoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues,
  });

  const { mutate, isPending } = useLoginMutation({
    configs: {
      onSuccess: data => {
        login(data?.data?.data);
        toast.success('Login successful');
        router.push('/library');
      },
      onError: error => {
        const err =
          error.response?.data?.message || 'Login failed. Please try again.';
        toast.error(err);
      },
    },
  });

  const onSubmit = async (values: TLoginSchema) => {
    const body: ILoginBody = {
      email: values.email,
      password: values.password,
    };

    mutate({ body });
  };

  return {
    form,
    handleSubmit: form.handleSubmit(onSubmit),
    isPending,
  };
};

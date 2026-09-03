'use client';

import { useAuth } from '@/hooks';
import type { IRegisterBody, IRegisterResponse } from '@/interfaces';
import { useRegisterMutation } from '@/services';
import { type IApiResponse } from '@/types';
import { registerSchema, type TRegisterSchema } from '@/validations';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

const defaultValues = {
  email: '',
  password: '',
  confirmPassword: '',
  name: '',
};

export const useRegisterForm = () => {
  const router = useRouter();

  const { register: registerUser } = useAuth();

  const form = useForm<TRegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues,
  });

  const { mutate, isPending } = useRegisterMutation();

  const onSubmit = async (values: TRegisterSchema) => {
    const body: IRegisterBody = {
      email: values.email,
      password: values.password,
      name: values.name,
    };
    mutate(
      { body },
      {
        onSuccess: (data: IApiResponse<IRegisterResponse>) => {
          registerUser(data.data);
          router.push('/login');
          toast.success('Registration successful');
        },
        onError: error => {
          const err = error.response?.data?.message || 'Registration failed';
          toast.error(err);
        },
      }
    );
  };

  return {
    form,
    handleSubmit: form.handleSubmit(onSubmit),
    onSubmit,
    isPending,
  };
};

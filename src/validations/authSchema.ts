import z from 'zod';

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const registerSchema = z
  .object({
    name: z.string().optional(),
    email: z
      .string()
      .min(1, { message: 'Email is required' })
      .regex(emailRegex, 'Invalid email address'),
    password: z
      .string()
      .min(1, { message: 'Password is required' })
      .regex(
        passwordRegex,
        'Password includes at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character'
      ),
    confirmPassword: z
      .string()
      .min(1, { message: 'Confirm password is required' })
      .regex(
        passwordRegex,
        'Password includes at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character'
      ),
  })
  .refine(data => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export type TRegisterSchema = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email is required' })
    .regex(emailRegex, 'Invalid email address'),
  password: z
    .string()
    .min(1, { message: 'Password is required' })
    .regex(
      passwordRegex,
      'Password includes at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character'
    ),
});

export type TLoginSchema = z.infer<typeof loginSchema>;

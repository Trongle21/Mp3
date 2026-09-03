import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="rounded-xl border border-border bg-bg-secondary p-8">
      <h1 className="text-h2 text-text-primary">Welcome back</h1>
      <p className="mt-1 text-body text-text-secondary">
        Log in to keep listening.
      </p>
      <LoginForm />
    </div>
  );
}

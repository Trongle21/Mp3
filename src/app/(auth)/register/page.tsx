import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="rounded-xl border border-border bg-bg-secondary p-8">
      <h1 className="text-h2 text-text-primary">Create your account</h1>
      <p className="mt-1 text-body text-text-secondary">Start building your library.</p>
      <RegisterForm />
    </div>
  );
}

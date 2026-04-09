import { LoginForm } from "@/app/[locale]/login/components/login-form";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 relative">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}

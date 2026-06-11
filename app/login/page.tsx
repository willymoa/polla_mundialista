import Link from "next/link";
import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-sm sm:p-8">
        <h1 className="mb-6 text-center text-2xl font-bold text-brand-primary">
          Iniciar sesión
        </h1>
        <LoginForm />
        <p className="mt-6 text-center text-sm text-brand-primary/70">
          ¿No tienes cuenta?{" "}
          <Link href="/registro" className="font-semibold text-brand-accent">
            Crea una
          </Link>
        </p>
      </div>
    </main>
  );
}

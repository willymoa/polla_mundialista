import Link from "next/link";
import { RegistroForm } from "@/components/RegistroForm";

export default function RegistroPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-center text-2xl font-bold text-brand-primary">
          Crear cuenta
        </h1>
        <RegistroForm />
        <p className="mt-6 text-center text-sm text-brand-primary/70">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-semibold text-brand-accent">
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  );
}

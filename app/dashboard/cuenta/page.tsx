import Link from "next/link";
import { requireAuth, getCurrentUser } from "@/lib/permissions";
import { EditarPerfilForm } from "@/components/EditarPerfilForm";
import { CambiarPasswordForm } from "@/components/CambiarPasswordForm";

export default async function CuentaPage() {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  return (
    <main className="flex flex-1 flex-col gap-6 px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-primary">Mi cuenta</h1>
        <Link
          href="/dashboard"
          className="text-sm text-brand-primary/70 hover:text-brand-primary"
        >
          ← Volver al panel
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-brand-primary">Datos personales</h2>
          <EditarPerfilForm
            defaultValues={{ nombre: user.nombre, email: user.email }}
          />
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-brand-primary">Contraseña</h2>
          <p className="mb-4 text-sm text-brand-primary/70">
            Para cambiar tu contraseña necesitas conocer la actual.
          </p>
          <CambiarPasswordForm />
        </div>
      </div>
    </main>
  );
}

import { redirect } from "next/navigation";
import { requireAuth, getUserOrganizations } from "@/lib/permissions";
import {
  CrearOrganizacionForm,
  UnirseConCodigoForm,
} from "@/components/OnboardingForms";

export default async function OnboardingPage() {
  const user = await requireAuth();
  const membresias = await getUserOrganizations(user.id);

  if (membresias.length > 0) {
    redirect("/dashboard");
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-16">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-brand-primary">
          ¡Bienvenido a Polla Mundialista Pro!
        </h1>
        <p className="mt-2 max-w-md text-brand-primary/70">
          Crea tu organización o únete a una existente con un código de
          invitación para empezar a participar en pollas.
        </p>
      </div>

      <div className="grid w-full max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-brand-primary">
            Crear una organización
          </h2>
          <CrearOrganizacionForm />
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-brand-primary">
            Unirse con un código
          </h2>
          <UnirseConCodigoForm />
        </div>
      </div>
    </main>
  );
}

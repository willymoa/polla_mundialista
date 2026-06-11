import { requireOrgRole } from "@/lib/permissions";
import { EditarOrganizacionForm } from "@/components/EditarOrganizacionForm";

export default async function ConfiguracionOrgPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const { organizacion } = await requireOrgRole(orgSlug, ["OWNER"]);

  return (
    <main className="page-main">
      <h1 className="text-2xl font-bold text-brand-primary">
        Configuración de {organizacion.nombre}
      </h1>

      <div className="max-w-md rounded-xl bg-white p-6 shadow-sm">
        <EditarOrganizacionForm
          orgSlug={orgSlug}
          defaultValues={{
            nombre: organizacion.nombre,
            logoUrl: organizacion.logoUrl ?? "",
            brandColor: organizacion.brandColor ?? "",
          }}
        />
      </div>
    </main>
  );
}

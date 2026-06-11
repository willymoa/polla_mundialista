import { requireOrgRole } from "@/lib/permissions";
import { CrearPollaForm } from "@/components/CrearPollaForm";

export default async function NuevaPollaPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  await requireOrgRole(orgSlug, ["OWNER", "ADMIN"]);

  return (
    <main className="page-main">
      <h1 className="text-2xl font-bold text-brand-primary">Nueva polla</h1>
      <div className="max-w-xl rounded-xl bg-white p-6 shadow-sm">
        <CrearPollaForm orgSlug={orgSlug} />
      </div>
    </main>
  );
}

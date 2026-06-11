import { prisma } from "@/lib/prisma";
import { requirePollaAccess, esAdminPolla } from "@/lib/permissions";
import { EquiposManager } from "@/components/EquiposManager";

export default async function EquiposPage({
  params,
}: {
  params: Promise<{ orgSlug: string; pollaSlug: string }>;
}) {
  const { orgSlug, pollaSlug } = await params;
  const { polla, membresiaOrg, participante } = await requirePollaAccess(orgSlug, pollaSlug);

  const esAdmin = esAdminPolla(membresiaOrg, participante);

  const equipos = await prisma.equipo.findMany({
    where: { pollaId: polla.id },
    orderBy: [{ grupo: "asc" }, { nombre: "asc" }],
  });

  return (
    <main className="flex flex-1 flex-col gap-6 px-6 py-10">
      <h1 className="text-2xl font-bold text-brand-primary">Equipos de {polla.nombre}</h1>
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <EquiposManager
          orgSlug={orgSlug}
          pollaSlug={pollaSlug}
          equipos={equipos}
          esAdmin={esAdmin}
        />
      </div>
    </main>
  );
}

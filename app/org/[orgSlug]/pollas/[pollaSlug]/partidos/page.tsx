import { prisma } from "@/lib/prisma";
import { requirePollaAccess, esAdminPolla } from "@/lib/permissions";
import { PartidosManager } from "@/components/PartidosManager";

export default async function PartidosPage({
  params,
}: {
  params: Promise<{ orgSlug: string; pollaSlug: string }>;
}) {
  const { orgSlug, pollaSlug } = await params;
  const { polla, membresiaOrg, participante } = await requirePollaAccess(orgSlug, pollaSlug);

  const esAdmin = esAdminPolla(membresiaOrg, participante);

  const [partidos, equipos] = await Promise.all([
    prisma.partido.findMany({
      where: { pollaId: polla.id },
      include: {
        equipoLocal: { select: { nombre: true } },
        equipoVisitante: { select: { nombre: true } },
      },
      orderBy: { fechaHora: "asc" },
    }),
    prisma.equipo.findMany({
      where: { pollaId: polla.id },
      orderBy: { nombre: "asc" },
      select: { id: true, nombre: true },
    }),
  ]);

  return (
    <main className="page-main">
      <h1 className="text-2xl font-bold text-brand-primary">Partidos de {polla.nombre}</h1>
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <PartidosManager
          orgSlug={orgSlug}
          pollaSlug={pollaSlug}
          partidos={partidos}
          equipos={equipos}
          esAdmin={esAdmin}
        />
      </div>
    </main>
  );
}

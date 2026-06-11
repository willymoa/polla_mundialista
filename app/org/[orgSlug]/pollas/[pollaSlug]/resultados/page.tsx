import { prisma } from "@/lib/prisma";
import { requirePollaRole } from "@/lib/permissions";
import { ResultadosManager } from "@/components/ResultadosManager";

export default async function ResultadosPage({
  params,
}: {
  params: Promise<{ orgSlug: string; pollaSlug: string }>;
}) {
  const { orgSlug, pollaSlug } = await params;
  const { polla } = await requirePollaRole(orgSlug, pollaSlug, ["ADMIN_POLLA"]);

  const partidos = await prisma.partido.findMany({
    where: { pollaId: polla.id },
    include: {
      equipoLocal: { select: { nombre: true } },
      equipoVisitante: { select: { nombre: true } },
    },
    orderBy: { fechaHora: "asc" },
  });

  return (
    <main className="page-main">
      <h1 className="text-2xl font-bold text-brand-primary">Resultados de {polla.nombre}</h1>
      <p className="text-sm text-brand-primary/70">
        Al marcar un partido como finalizado con su marcador, los puntos de los participantes se
        recalculan automáticamente.
      </p>
      <ResultadosManager orgSlug={orgSlug} pollaSlug={pollaSlug} partidos={partidos} />
    </main>
  );
}

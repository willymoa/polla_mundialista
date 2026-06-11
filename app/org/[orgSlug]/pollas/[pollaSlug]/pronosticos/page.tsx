import { prisma } from "@/lib/prisma";
import { requirePollaAccess } from "@/lib/permissions";
import { partidoBloqueado } from "@/lib/locks";
import { pollaPermiteEscritura } from "@/lib/polla-estado";
import { PronosticosManager } from "@/components/PronosticosManager";

export default async function PronosticosPage({
  params,
}: {
  params: Promise<{ orgSlug: string; pollaSlug: string }>;
}) {
  const { orgSlug, pollaSlug } = await params;
  const { user, polla, participante } = await requirePollaAccess(orgSlug, pollaSlug);

  const partidos = await prisma.partido.findMany({
    where: { pollaId: polla.id },
    include: {
      equipoLocal: { select: { nombre: true } },
      equipoVisitante: { select: { nombre: true } },
      pronosticos: { where: { userId: user.id } },
    },
    orderBy: { fechaHora: "asc" },
  });

  const partidosConPronostico = partidos.map((partido) => ({
    id: partido.id,
    fechaHora: partido.fechaHora,
    fase: partido.fase,
    bloqueado: partidoBloqueado(polla, partido) || !pollaPermiteEscritura(polla),
    equipoLocal: partido.equipoLocal,
    equipoVisitante: partido.equipoVisitante,
    golesLocalReal: partido.golesLocalReal,
    golesVisitanteReal: partido.golesVisitanteReal,
    pronostico: partido.pronosticos[0]
      ? {
          golesLocal: partido.pronosticos[0].golesLocal,
          golesVisitante: partido.pronosticos[0].golesVisitante,
          puntos: partido.pronosticos[0].puntos,
          tipoAcierto: partido.pronosticos[0].tipoAcierto,
        }
      : null,
  }));

  const puedeEditar =
    pollaPermiteEscritura(polla) &&
    !!participante &&
    participante.role !== "ESPECTADOR" &&
    participante.estado === "ACTIVO";

  return (
    <main className="flex flex-1 flex-col gap-6 px-6 py-10">
      <h1 className="text-2xl font-bold text-brand-primary">
        Mis pronósticos · {polla.nombre}
      </h1>
      {!pollaPermiteEscritura(polla) && (
        <p className="text-brand-primary/70">
          Esta polla está inactiva u oculta. Solo puedes consultar tus pronósticos existentes.
        </p>
      )}
      {!participante && (
        <p className="text-brand-primary/70">
          Debes inscribirte en esta polla para registrar pronósticos.
        </p>
      )}
      {participante?.role === "ESPECTADOR" && (
        <p className="text-brand-primary/70">
          Tu rol en esta polla es espectador, por lo que no puedes registrar pronósticos.
        </p>
      )}
      <PronosticosManager
        orgSlug={orgSlug}
        pollaSlug={pollaSlug}
        partidos={partidosConPronostico}
        puedeEditar={puedeEditar}
      />
    </main>
  );
}

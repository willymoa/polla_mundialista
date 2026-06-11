import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePollaAccess, esAdminPolla } from "@/lib/permissions";
import { ESTADO_POLLA_LABEL, pollaPermiteEscritura } from "@/lib/polla-estado";
import { InscribirseButton } from "@/components/InscribirseButton";
import { SimpleBarChart } from "@/components/SimpleBarChart";

const LOCK_MODE_LABEL: Record<string, string> = {
  PER_MATCH: "Por partido",
  GLOBAL_DEADLINE: "Fecha límite global",
};

export default async function PollaDetailPage({
  params,
}: {
  params: Promise<{ orgSlug: string; pollaSlug: string }>;
}) {
  const { orgSlug, pollaSlug } = await params;
  const { polla, membresiaOrg, participante } = await requirePollaAccess(orgSlug, pollaSlug);

  const esAdmin = esAdminPolla(membresiaOrg, participante);
  const permiteEscritura = pollaPermiteEscritura(polla);
  const base = `/org/${orgSlug}/pollas/${pollaSlug}`;

  const [totalParticipantes, topParticipantes] = await Promise.all([
    prisma.participantePolla.count({ where: { pollaId: polla.id } }),
    prisma.participantePolla.findMany({
      where: { pollaId: polla.id },
      include: { user: { select: { nombre: true } } },
      orderBy: [
        { puntosTotales: "desc" },
        { marcadoresExactos: "desc" },
        { aciertosResultado: "desc" },
        { createdAt: "asc" },
      ],
      take: 5,
    }),
  ]);

  const datosRanking = topParticipantes.map((p) => ({
    name: p.user.nombre,
    valor: p.puntosTotales,
  }));

  return (
    <main className="page-main">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">{polla.nombre}</h1>
          {polla.descripcion && (
            <p className="mt-1 text-brand-primary/70">{polla.descripcion}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {esAdmin && (
            <Link
              href={`${base}/configuracion`}
              className="rounded-lg border border-brand-primary px-4 py-2 text-sm font-semibold text-brand-primary transition hover:bg-brand-primary hover:text-white"
            >
              Editar configuración
            </Link>
          )}
          {!participante && (
            <InscribirseButton
              orgSlug={orgSlug}
              pollaSlug={pollaSlug}
              deshabilitado={!permiteEscritura}
              motivoDeshabilitado="Esta polla está inactiva u oculta. No se aceptan nuevas inscripciones."
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-brand-primary/70">Estado</p>
          <p className="text-lg font-semibold text-brand-primary">
            {ESTADO_POLLA_LABEL[polla.estado]}
          </p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-brand-primary/70">Torneo</p>
          <p className="text-lg font-semibold text-brand-primary">
            {polla.torneo ?? "—"}
          </p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-brand-primary/70">Modo de bloqueo</p>
          <p className="text-lg font-semibold text-brand-primary">
            {LOCK_MODE_LABEL[polla.lockMode]}
          </p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-brand-primary/70">Participantes</p>
          <p className="text-lg font-semibold text-brand-primary">{totalParticipantes}</p>
        </div>
      </div>

      {participante && (
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold text-brand-primary">Tu participación</h2>
          <p className="text-sm text-brand-primary/70">
            Rol: <span className="font-semibold">{participante.role}</span> · Estado:{" "}
            <span className="font-semibold">{participante.estado}</span> · Pago:{" "}
            <span className="font-semibold">{participante.pago ? "Confirmado" : "Pendiente"}</span>
          </p>
          <p className="mt-2 text-sm text-brand-primary/70">
            Puntos totales: <span className="font-semibold">{participante.puntosTotales}</span>
          </p>
        </div>
      )}

      {topParticipantes.length > 0 && (
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-brand-primary">Top 5 ranking</h2>
          <SimpleBarChart data={datosRanking} valueLabel="Puntos" color="#4CAF82" />
        </div>
      )}

      {esAdmin && (
        <p className="text-sm text-brand-primary/70">
          Eres administrador de esta polla. Desde la navegación puedes gestionar equipos,
          partidos, resultados y la configuración de la polla.
        </p>
      )}
    </main>
  );
}

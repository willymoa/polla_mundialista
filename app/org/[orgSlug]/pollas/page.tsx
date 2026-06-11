import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { requireOrgRole } from "@/lib/permissions";
import { ESTADO_POLLA_LABEL, ESTADO_POLLA_BADGE, esAdminOrg } from "@/lib/polla-estado";
import { PollasFiltro } from "@/components/PollasFiltro";
import type { EstadoPolla } from "@prisma/client";

const FILTROS_VALIDOS: EstadoPolla[] = [
  "ACTIVA",
  "OCULTA",
  "INACTIVA",
  "ARCHIVADA",
  "BORRADOR",
  "FINALIZADA",
];

export default async function PollasPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgSlug: string }>;
  searchParams: Promise<{ estado?: string }>;
}) {
  const { orgSlug } = await params;
  const { estado: estadoFiltro = "" } = await searchParams;
  const { user, organizacion, membresia } = await requireOrgRole(orgSlug, [
    "OWNER",
    "ADMIN",
    "MIEMBRO",
  ]);

  const esAdmin = esAdminOrg(membresia);

  const where: { organizacionId: string; estado?: EstadoPolla; NOT?: { estado: EstadoPolla } } = {
    organizacionId: organizacion.id,
  };

  if (estadoFiltro && FILTROS_VALIDOS.includes(estadoFiltro as EstadoPolla)) {
    where.estado = estadoFiltro as EstadoPolla;
  } else if (!esAdmin) {
    where.NOT = { estado: "OCULTA" };
  }

  const pollas = await prisma.polla.findMany({
    where,
    include: {
      _count: { select: { participantes: true } },
      participantes: {
        where: { userId: user.id },
        select: { id: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="flex flex-1 flex-col gap-6 px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-primary">
          Pollas de {organizacion.nombre}
        </h1>
        {esAdmin && (
          <Link
            href={`/org/${orgSlug}/pollas/nueva`}
            className="rounded-lg bg-brand-accent px-4 py-2 font-semibold text-white transition hover:opacity-90"
          >
            Nueva polla
          </Link>
        )}
      </div>

      {esAdmin && (
        <Suspense fallback={null}>
          <PollasFiltro orgSlug={orgSlug} activo={estadoFiltro} />
        </Suspense>
      )}

      {pollas.length === 0 ? (
        <p className="text-brand-primary/70">
          {estadoFiltro
            ? "No hay pollas con ese estado."
            : "Todavía no hay pollas creadas en esta organización."}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pollas.map((polla) => (
            <div
              key={polla.id}
              className="flex flex-col gap-2 rounded-xl bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <Link
                  href={`/org/${orgSlug}/pollas/${polla.slug}`}
                  className="text-lg font-semibold text-brand-primary hover:underline"
                >
                  {polla.nombre}
                </Link>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-semibold ${ESTADO_POLLA_BADGE[polla.estado]}`}
                >
                  {ESTADO_POLLA_LABEL[polla.estado]}
                </span>
              </div>
              {polla.torneo && (
                <p className="text-sm text-brand-primary/70">{polla.torneo}</p>
              )}
              <p className="text-sm text-brand-primary/70">
                {polla._count.participantes} participante
                {polla._count.participantes === 1 ? "" : "s"}
              </p>
              {polla.participantes.length === 0 && (
                <span className="inline-block w-fit rounded-full bg-brand-positive/20 px-2 py-1 text-xs font-semibold text-brand-positive">
                  Sin inscribirme aún
                </span>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                <Link
                  href={`/org/${orgSlug}/pollas/${polla.slug}`}
                  className="text-sm font-medium text-brand-primary hover:underline"
                >
                  Ver detalle
                </Link>
                {esAdmin && (
                  <Link
                    href={`/org/${orgSlug}/pollas/${polla.slug}/configuracion`}
                    className="text-sm font-medium text-brand-accent hover:underline"
                  >
                    Configurar
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

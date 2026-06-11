import { prisma } from "@/lib/prisma";
import { requirePollaRole } from "@/lib/permissions";
import { REGLA_PUNTUACION_DEFAULT } from "@/lib/scoring";
import { EditarPollaForm } from "@/components/EditarPollaForm";
import { EliminarPollaButton } from "@/components/EliminarPollaButton";
import { ParticipantesPollaTable } from "@/components/ParticipantesPollaTable";
import { AgregarParticipanteForm } from "@/components/AgregarParticipanteForm";
import { ReglaPuntuacionForm } from "@/components/ReglaPuntuacionForm";

export default async function ConfiguracionPollaPage({
  params,
}: {
  params: Promise<{ orgSlug: string; pollaSlug: string }>;
}) {
  const { orgSlug, pollaSlug } = await params;
  const { polla, membresiaOrg } = await requirePollaRole(orgSlug, pollaSlug, ["ADMIN_POLLA"]);

  const [participantes, reglaPuntuacion, miembrosOrg] = await Promise.all([
    prisma.participantePolla.findMany({
      where: { pollaId: polla.id },
      include: { user: { select: { nombre: true, email: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.reglaPuntuacion.findUnique({ where: { pollaId: polla.id } }),
    prisma.membresia.findMany({
      where: { organizacionId: polla.organizacionId },
      include: { user: { select: { id: true, nombre: true, email: true } } },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const idsParticipantes = new Set(participantes.map((p) => p.userId));
  const miembrosDisponibles = miembrosOrg
    .filter((m) => !idsParticipantes.has(m.user.id))
    .map((m) => ({ userId: m.user.id, nombre: m.user.nombre, email: m.user.email }));

  const puedeEliminarPolla = membresiaOrg.role === "OWNER" || membresiaOrg.role === "ADMIN";

  return (
    <main className="flex flex-1 flex-col gap-6 px-6 py-10">
      <h1 className="text-2xl font-bold text-brand-primary">
        Configuración de {polla.nombre}
      </h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow-sm lg:col-span-1">
          <h2 className="mb-4 text-lg font-semibold text-brand-primary">Datos generales</h2>
          <EditarPollaForm
            orgSlug={orgSlug}
            pollaSlug={pollaSlug}
            defaultValues={{
              nombre: polla.nombre,
              descripcion: polla.descripcion ?? "",
              torneo: polla.torneo ?? "",
              lockMode: polla.lockMode,
              esPublica: polla.esPublica,
              estado: polla.estado,
            }}
          />

          {puedeEliminarPolla && (
            <div className="mt-6 border-t border-gray-100 pt-4">
              <EliminarPollaButton orgSlug={orgSlug} pollaSlug={pollaSlug} nombrePolla={polla.nombre} />
            </div>
          )}
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-brand-primary">Participantes</h2>
          <ParticipantesPollaTable
            orgSlug={orgSlug}
            pollaSlug={pollaSlug}
            participantes={participantes}
          />

          <div className="mt-6 border-t border-gray-100 pt-4">
            <h3 className="mb-2 text-sm font-semibold text-brand-primary">Agregar participante</h3>
            <AgregarParticipanteForm
              orgSlug={orgSlug}
              pollaSlug={pollaSlug}
              miembrosDisponibles={miembrosDisponibles}
            />
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="mb-4 text-lg font-semibold text-brand-primary">Reglas de puntuación</h2>
          <ReglaPuntuacionForm
            orgSlug={orgSlug}
            pollaSlug={pollaSlug}
            defaultValues={{
              puntosMarcadorExacto:
                reglaPuntuacion?.puntosMarcadorExacto ?? REGLA_PUNTUACION_DEFAULT.puntosMarcadorExacto,
              puntosResultado:
                reglaPuntuacion?.puntosResultado ?? REGLA_PUNTUACION_DEFAULT.puntosResultado,
              puntosBonusDiferencia:
                reglaPuntuacion?.puntosBonusDiferencia ?? REGLA_PUNTUACION_DEFAULT.puntosBonusDiferencia,
              puntosCampeon: reglaPuntuacion?.puntosCampeon ?? null,
              puntosFinalista: reglaPuntuacion?.puntosFinalista ?? null,
              puntosGoleador: reglaPuntuacion?.puntosGoleador ?? null,
              permiteEditarHastaInicio: reglaPuntuacion?.permiteEditarHastaInicio ?? true,
            }}
          />
        </div>
      </div>
    </main>
  );
}

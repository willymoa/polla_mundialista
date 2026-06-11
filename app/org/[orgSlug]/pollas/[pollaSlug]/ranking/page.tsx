import { prisma } from "@/lib/prisma";
import { requirePollaAccess } from "@/lib/permissions";

export default async function RankingPage({
  params,
}: {
  params: Promise<{ orgSlug: string; pollaSlug: string }>;
}) {
  const { orgSlug, pollaSlug } = await params;
  const { polla } = await requirePollaAccess(orgSlug, pollaSlug);

  const participantes = await prisma.participantePolla.findMany({
    where: { pollaId: polla.id },
    include: { user: { select: { nombre: true } } },
    orderBy: [
      { puntosTotales: "desc" },
      { marcadoresExactos: "desc" },
      { aciertosResultado: "desc" },
      { createdAt: "asc" },
    ],
  });

  return (
    <main className="flex flex-1 flex-col gap-6 px-6 py-10">
      <h1 className="text-2xl font-bold text-brand-primary">Ranking · {polla.nombre}</h1>
      <p className="text-sm text-brand-primary/70">
        En caso de empate en puntos, se desempata por marcadores exactos, luego por aciertos de
        resultado y, finalmente, por orden de inscripción.
      </p>

      {participantes.length === 0 ? (
        <p className="text-sm text-brand-primary/70">Aún no hay participantes en esta polla.</p>
      ) : (
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-brand-primary/70">
                <th className="py-2">#</th>
                <th className="py-2">Participante</th>
                <th className="py-2">Puntos</th>
                <th className="py-2">Marcadores exactos</th>
                <th className="py-2">Aciertos de resultado</th>
              </tr>
            </thead>
            <tbody>
              {participantes.map((p, index) => (
                <tr key={p.id} className="border-b border-gray-100">
                  <td className="py-2 font-semibold text-brand-primary">{index + 1}</td>
                  <td className="py-2">{p.user.nombre}</td>
                  <td className="py-2 font-semibold text-brand-primary">{p.puntosTotales}</td>
                  <td className="py-2">{p.marcadoresExactos}</td>
                  <td className="py-2">{p.aciertosResultado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

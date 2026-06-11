import { prisma } from "@/lib/prisma";
import { PlanesManager } from "@/components/PlanesManager";
import { ensureDefaultPlans } from "@/lib/default-plans";

export default async function AdminPlanesPage() {
  await ensureDefaultPlans();

  const planes = await prisma.plan.findMany({ orderBy: { maxPollas: "asc" } });

  return (
    <main className="flex flex-1 flex-col gap-6 px-6 py-10">
      <h1 className="text-2xl font-bold text-brand-primary">Planes</h1>
      <PlanesManager planes={planes} />
    </main>
  );
}

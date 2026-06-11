"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { cambiarPlanOrganizacionAction } from "@/app/admin-platform/actions";

export function PlanSelect({
  organizacionId,
  planActualId,
  planes,
}: {
  organizacionId: string;
  planActualId: string | null;
  planes: { id: string; nombre: string }[];
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <select
      disabled={isPending}
      defaultValue={planActualId ?? ""}
      onChange={(e) =>
        startTransition(async () => {
          await cambiarPlanOrganizacionAction({
            organizacionId,
            planId: e.target.value,
          });
          router.refresh();
        })
      }
      className="rounded-lg border border-gray-300 px-2 py-1 text-sm focus:border-brand-primary focus:outline-none"
    >
      <option value="" disabled>
        Sin plan
      </option>
      {planes.map((plan) => (
        <option key={plan.id} value={plan.id}>
          {plan.nombre}
        </option>
      ))}
    </select>
  );
}

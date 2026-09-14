import { notFound } from "next/navigation";
import { getThursday } from "@/actions/thursdays";
import ProductionCard from "@/components/domain/productions/ProductionCard";
import { normalizeThursdayName } from "@/helpers";
import { isAdminRole } from "@/constants/roles";
import { auth } from "@/authentication";

export const thursdayDetailDialogClassName = "h-dvh w-[min(52rem,100%)] min-[769px]:h-auto";

interface ThursdayDetailContentProps {
  thursdayId: string;
}

export default async function ThursdayDetailContent({ thursdayId }: ThursdayDetailContentProps) {
  const result = await getThursday(thursdayId);
  if (!result.success) notFound();

  const session = await auth();
  const isAdmin = isAdminRole(session?.user?.role);

  const thursday = result.data;
  const thursdayName = normalizeThursdayName(thursday.name);
  const formattedDate = new Date(thursday.date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="flex flex-col">
      <div className="mb-4 flex items-baseline gap-4 pb-4">
        <h3 className="m-0 font-heading text-xl font-bold leading-tight">
          {thursdayName}
        </h3>
        <span className="whitespace-nowrap text-sm text-[var(--app-label)]">
          {formattedDate}
        </span>
      </div>
      {thursday.productions.length > 0 ? (
        thursday.productions.map((production: any, index: number) => (
          <ProductionCard
            key={production.id}
            thursday={thursday as any}
            production={production}
            productionIndex={index}
            productionCount={thursday.productions.length}
            isAdmin={isAdmin}
          />
        ))
      ) : (
        <p className="text-[var(--app-label)] italic">No productions scheduled on this Thursday yet.</p>
      )}
    </div>
  );
}

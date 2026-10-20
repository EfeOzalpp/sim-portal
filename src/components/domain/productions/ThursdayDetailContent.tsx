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

function isPlaceholderProduction(production: any) {
  return (
    production.name === "Big Production" &&
    production.location === "Pozen Center" &&
    (production.tags?.length ?? 0) === 0 &&
    (production.producers?.length ?? 0) === 0 &&
    (production.presentations?.length ?? 0) === 0
  );
}

export async function ThursdayDetailTitle({ thursdayId }: ThursdayDetailContentProps) {
  const result = await getThursday(thursdayId);
  if (!result.success) return "Thursday";

  const thursday = result.data;
  const thursdayName = normalizeThursdayName(thursday.name);

  return (
    <span className="min-w-0 truncate">{thursdayName}</span>
  );
}

export default async function ThursdayDetailContent({ thursdayId }: ThursdayDetailContentProps) {
  const result = await getThursday(thursdayId);
  if (!result.success) notFound();

  const session = await auth();
  const isAdmin = isAdminRole(session?.user?.role);

  const thursday = result.data;
  const displayProductions = thursday.productions.length > 0
    ? thursday.productions.map((production: any) => (
        isPlaceholderProduction(production)
          ? { ...production, isPlaceholderDisplay: true }
          : production
      ))
    : [{
        id: `${thursday.id}-empty-production`,
        name: "",
        location: "Pozen Center",
        producers: [],
        presentations: [],
        isPlaceholderDisplay: true,
      }];

  return (
    <div className="flex flex-col">
      {displayProductions.map((production: any, index: number) => (
        <ProductionCard
          key={production.id}
          thursday={thursday as any}
          production={production}
          productionIndex={index}
          productionCount={displayProductions.length}
          isAdmin={isAdmin}
        />
      ))}
    </div>
  );
}

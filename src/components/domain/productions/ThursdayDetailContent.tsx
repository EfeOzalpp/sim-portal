import { notFound } from "next/navigation";
import { getThursday } from "@/actions/thursdays";
import ProductionCard from "@/components/domain/productions/ProductionCard";
import { normalizeThursdayName } from "@/helpers";
import { isAdminRole } from "@/constants/roles";
import { auth } from "@/authentication";
import { formatSemesterCode } from "@/components/domain/filters/semester-filter";
import { formatShortMonthDay } from "@/constants/date-format";
import { getLabelColors } from "@/constants/labelColors";

export const thursdayDetailDialogClassName = "h-dvh w-[min(52rem,100%)] min-[769px]:h-auto";

interface ThursdayDetailContentProps {
  thursdayId: string;
}

export async function ThursdayDetailTitle({ thursdayId }: ThursdayDetailContentProps) {
  const result = await getThursday(thursdayId);
  if (!result.success) return "Thursday";

  const thursday = result.data;
  const thursdayName = normalizeThursdayName(thursday.name);
  const formattedDate = formatShortMonthDay(thursday.date);
  const dateColors = formattedDate ? getLabelColors(formattedDate) : undefined;
  const semesterCode = thursday.semester?.name ? formatSemesterCode(thursday.semester.name) : undefined;

  return (
    <span className="flex min-w-0 flex-wrap items-baseline gap-2">
      <span className="min-w-0 truncate">{thursdayName}</span>
      {formattedDate && dateColors && (
        <span
          className="ui-label m-0 block w-fit flex-none rounded-md px-2 py-1 font-sans text-xs leading-tight font-semibold uppercase"
          style={{ backgroundColor: dateColors.bg, color: dateColors.text }}
        >
          {formattedDate}
        </span>
      )}
      {semesterCode && (
        <span
          className="ui-label m-0 block w-fit flex-none rounded-md px-2 py-1 font-sans text-xs leading-tight font-semibold uppercase"
          style={{ backgroundColor: "var(--elevated-2-label-bg)", color: "var(--elevated-2-label-text)" }}
        >
          {semesterCode}
        </span>
      )}
    </span>
  );
}

export default async function ThursdayDetailContent({ thursdayId }: ThursdayDetailContentProps) {
  const result = await getThursday(thursdayId);
  if (!result.success) notFound();

  const session = await auth();
  const isAdmin = isAdminRole(session?.user?.role);

  const thursday = result.data;

  return (
    <div className="flex flex-col">
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
        <p className="text-[var(--label-text)] italic">No productions scheduled on this Thursday yet.</p>
      )}
    </div>
  );
}

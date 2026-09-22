import Link from "next/link";
import SemesterBadge from "@/components/domain/productions/SemesterBadge";
import { MaskIcon } from "@/theme/MaskIcon";
import { formatShortMonthDayYear } from "@/constants/date-format";

interface ProductionSummaryCardProps {
  production: any;
}

const metaIconClassName = "h-4 w-4 flex-none bg-[var(--app-text)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]";
const viewArrowIconClassName = "h-4 w-4 flex-none bg-[var(--app-text)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]";

// Compact production card for a user profile - same bordered-box language
// as PresentationCard's isUserProfile variant, so "Productions" and
// "Presentations" read as one consistent list style in the profile. Unlike
// PresentationCard, this only ever renders in that one context, so it
// doesn't need a non-profile branch.
export default function ProductionSummaryCard({ production }: ProductionSummaryCardProps) {
  const thursdayId = production.thursday?.id;
  const semesterName = production.thursday?.semester?.name;
  const formattedDate = formatShortMonthDayYear(production.thursday?.date);

  const cardContent = (
    <>
      <SemesterBadge name={semesterName} />
      <h4 className="m-0">{production.name}</h4>
      {(production.location || formattedDate) && (
        <div className="mt-1 flex w-full flex-row flex-wrap items-center gap-x-4 gap-y-2 text-[var(--subtle-text)] [&_div]:m-0">
          {production.location && (
            <div className="flex items-center gap-1.5">
              <MaskIcon icon="location/location.svg" className={metaIconClassName} />
              {production.location}
            </div>
          )}
          {formattedDate && (
            <div className="flex items-center gap-1.5">
              <MaskIcon icon="day/day.svg" className={metaIconClassName} />
              {formattedDate}
            </div>
          )}
        </div>
      )}
      {thursdayId && (
        <div className="absolute top-1/2 right-4 flex -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
          <MaskIcon icon="view/forward.svg" className={viewArrowIconClassName} />
        </div>
      )}
    </>
  );

  if (thursdayId) {
    return (
      <Link
        href={`/thursdays/${thursdayId}`}
        className="group relative flex w-full flex-col gap-2 rounded-xl bg-[var(--app-subtle)] p-4 text-inherit no-underline hover:brightness-95 dark:hover:brightness-125"
      >
        {cardContent}
      </Link>
    );
  }

  return (
    <div className="relative flex w-full flex-col gap-2 rounded-xl bg-[var(--app-subtle)] p-4">
      {cardContent}
    </div>
  );
}

import { Button } from "@/components/button";
import SemesterBadge from "@/components/domain/productions/SemesterBadge";
import { MaskIcon } from "@/theme/MaskIcon";

interface ProductionSummaryCardProps {
  production: any;
}

const metaIconClassName = "h-4 w-4 flex-none bg-[var(--app-text)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]";

// Compact production card for a user profile - same bordered-box language
// as PresentationCard's isUserProfile variant, so "Productions" and
// "Presentations" read as one consistent list style in the profile. Unlike
// PresentationCard, this only ever renders in that one context, so it
// doesn't need a non-profile branch.
export default function ProductionSummaryCard({ production }: ProductionSummaryCardProps) {
  const thursdayId = production.thursday?.id;
  const semesterName = production.thursday?.semester?.name;
  const formattedDate = production.thursday?.date
    ? new Date(production.thursday.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;

  return (
    <div className="flex w-full flex-col gap-2 rounded-xl bg-[var(--app-subtle)] p-4 pt-5">
      <SemesterBadge name={semesterName} />
      <div className="font-bold">{production.name}</div>
      {(production.location || formattedDate) && (
        <div className="flex w-full flex-row flex-wrap items-center gap-x-4 gap-y-2 text-[var(--subtle-text)] [&_div]:m-0">
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
        <div className="flex w-full justify-end">
          <Button href={`/thursdays/${thursdayId}`} variant="action" icon="view/forward.svg" iconPosition="end">
            View
          </Button>
        </div>
      )}
    </div>
  );
}

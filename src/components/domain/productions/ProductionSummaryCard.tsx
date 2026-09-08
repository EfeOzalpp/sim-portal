import { Button } from "@/components/button";
import SemesterBadge from "@/components/domain/productions/SemesterBadge";

interface ProductionSummaryCardProps {
  production: any;
}

// Compact production card for a user profile - same bordered-box language
// as PresentationCard's isUserProfile variant, so "Productions" and
// "Presentations" read as one consistent list style in the profile. Unlike
// PresentationCard, this only ever renders in that one context, so it
// doesn't need a non-profile branch.
export default function ProductionSummaryCard({ production }: ProductionSummaryCardProps) {
  const thursdayId = production.thursday?.id;
  const semesterName = production.thursday?.semester?.name;

  return (
    <div className="flex w-full flex-col gap-2 rounded-md border border-solid border-[var(--app-border)] bg-[var(--app-secondary)] p-2 pt-3">
      <SemesterBadge name={semesterName} />
      <div className="font-bold">{production.name}</div>
      {production.location && (
        <div className="flex w-full flex-row flex-wrap items-baseline gap-x-4 gap-y-2 [&_div]:m-0">
          <div>{production.location}</div>
        </div>
      )}
      {thursdayId && (
        <div className="flex w-full justify-start">
          <Button href={`/thursdays/${thursdayId}`} variant="action" icon="view/forward.svg" iconPosition="end">
            View
          </Button>
        </div>
      )}
    </div>
  );
}

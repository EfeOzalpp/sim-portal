import { formatSemesterCode } from "@/components/domain/filters/semester-filter";

interface SemesterBadgeProps {
  name?: string | null;
}

// Small pill shown above a presentation/production title wherever it can
// appear outside its own semester's context (e.g. a user profile, which
// lists someone's history across every semester at once) - without it,
// there's no way to tell a current entry apart from a mis-filed or
// years-old one at a glance.
export default function SemesterBadge({ name }: SemesterBadgeProps) {
  if (!name) return null;

  return (
    <div className="self-start rounded-md border border-solid border-[var(--label-border)] bg-[var(--label-bg)] px-2 py-1 font-sans text-xs leading-tight font-semibold text-[var(--label-text)] uppercase">
      {formatSemesterCode(name)}
    </div>
  );
}

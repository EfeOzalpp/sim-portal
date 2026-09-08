import clsx from "clsx";
import PersonLink from "@/components/domain/profile/PersonLink";
import PresentationCard from "@/components/domain/productions/PresentationCard";
import EditThursdayButton from "@/components/domain/productions/EditThursdayButton";
import { isAdminRole } from "@/constants/roles";

interface ProductionCardProps {
  thursday: any;
  production: any;
  productionIndex?: number;
  productionCount?: number;
  isAdmin?: boolean;
  // The Thursdays list (ThursdayCard/ProductionsCollapse) puts this
  // background on its own outer collapse card instead, covering the whole
  // expanded area rather than just this box - false there so the two
  // don't stack. The Thursday detail modal (ThursdayDetailContent), which
  // has no such wrapper of its own, keeps the default true.
  hasOwnBackground?: boolean;
}

function formatOrdinal(value: number) {
  const remainder = value % 100;
  if (remainder >= 11 && remainder <= 13) return `${value}th`;

  switch (value % 10) {
    case 1:
      return `${value}st`;
    case 2:
      return `${value}nd`;
    case 3:
      return `${value}rd`;
    default:
      return `${value}th`;
  }
}

export default async function ProductionCard({
  thursday,
  production,
  productionIndex = 0,
  productionCount = 1,
  isAdmin = false,
  hasOwnBackground = true,
}: ProductionCardProps) {
  const producers = production.producers.filter(
    (user: any) => !isAdminRole(user.role),
  );
  const faculty = production.producers.filter(
    (user: any) => isAdminRole(user.role),
  );
  const formattedDate = new Date(thursday.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const isMultiple = productionCount > 1;
  const productionTitle = isMultiple ? `${formatOrdinal(productionIndex + 1)} Production` : "Production";

  const titleRow = (
    <div className="flex items-center justify-between gap-2">
      <h3 className="m-0 text-[1.15rem] font-bold leading-[1.25]">{productionTitle}</h3>
      {isAdmin && <EditThursdayButton thursdayId={thursday.id} />}
    </div>
  );

  const fields = (
    <>
      <div className="flex flex-col gap-4 min-[768px]:flex-row">
        <div className="flex flex-1 flex-col gap-3">
          <div className="flex flex-col gap-1">
            <b>Name</b>
            <div className="leading-[1.4]">{production.name}</div>
          </div>
          <div className="flex flex-col gap-1">
            <b>Location</b>
            <div className="leading-[1.4]">{production.location}</div>
          </div>
          <div className="flex flex-col gap-1">
            <b>Date</b>
            <div className="leading-[1.4]">{formattedDate}</div>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-[0.4rem] pt-3 min-[768px]:pt-0">
          <b>Producers</b>
          <div className="mt-1 flex flex-row flex-wrap gap-x-2 gap-y-[0.15rem] min-[768px]:flex-col min-[768px]:gap-[0.2rem]">
            {producers.length > 0 ? (
              producers.map((producer: any) => (
                <PersonLink
                  key={producer.id}
                  userId={producer.id}
                  className="text-inherit! no-underline underline-offset-[0.14em] hover:text-[var(--brand-color)]! hover:underline"
                >
                  {producer.name}
                </PersonLink>
              ))
            ) : (
              <i>No producers credited yet.</i>
            )}
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-[0.4rem] pt-3 min-[768px]:pt-0">
          <b>Faculty</b>
          <div className="mt-1 flex flex-row flex-wrap gap-x-2 gap-y-[0.15rem] min-[768px]:flex-col min-[768px]:gap-[0.2rem]">
            {faculty.length > 0 ? (
              faculty.map((facultyMember: any) => (
                <PersonLink
                  key={facultyMember.id}
                  userId={facultyMember.id}
                  className="text-inherit! no-underline underline-offset-[0.14em] hover:text-[var(--brand-color)]! hover:underline"
                >
                  {facultyMember.name}
                </PersonLink>
              ))
            ) : (
              <i>No faculty assigned yet.</i>
            )}
          </div>
        </div>
      </div>

      <div className="my-3 border-t border-[var(--app-border)]" />

      <div>
        <span className="ui-label block">Presentations</span>
        <div className="mt-2">
          {production.presentations.length > 0 ? (
            production.presentations.map((presentation: any) => (
              <PresentationCard
                key={presentation.id}
                presentation={presentation}
              />
            ))
          ) : (
            <p>
              <i>No presentations for this production yet.</i>
            </p>
          )}
        </div>
      </div>
    </>
  );

  // A single production keeps its original, borderless layout untouched.
  // Multiple productions each get an ordinal title above a bordered box
  // (matching PresentationCard's isUserProfile box) around their fields,
  // so several productions under one Thursday read as distinct blocks
  // instead of one long flow separated only by thin dividers.
  if (!isMultiple) {
    return (
      <div>
        <div className="flex flex-col gap-2">
          {titleRow}
          {fields}
        </div>
      </div>
    );
  }

  return (
    <div className={clsx("flex flex-col gap-2", productionIndex > 0 && "mt-6")}>
      {titleRow}
      <div className={clsx("rounded-md border border-solid border-[var(--app-border)] p-3", hasOwnBackground && "bg-[var(--app-secondary)]")}>
        {fields}
      </div>
    </div>
  );
}

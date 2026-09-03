import PersonLink from "@/components/domain/users/PersonLink";
import PresentationCard from "@/components/domain/thursdays/PresentationCard";

interface ProductionCardProps {
  thursday: any;
  production: any;
  productionIndex?: number;
  productionCount?: number;
  isAdmin?: boolean;
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
}: ProductionCardProps) {
  const producers = production.producers.filter(
    (user: any) => user.role !== "ADMIN",
  );
  const faculty = production.producers.filter(
    (user: any) => user.role === "ADMIN",
  );
  const formattedDate = new Date(thursday.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const productionTitle =
    productionCount > 1 ? `${formatOrdinal(productionIndex + 1)} Production` : "Production";

  return (
    <div className={productionIndex > 0 ? "-mx-4 mt-7 border-t border-[var(--app-border)] px-4 pt-6" : undefined}>
      <div className="flex flex-col gap-2">
        <h3 className="m-0 text-[1.15rem] font-bold leading-[1.25]">{productionTitle}</h3>
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
    </div>
  );
}

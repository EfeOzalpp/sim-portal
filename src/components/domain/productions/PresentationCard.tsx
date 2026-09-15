import { Button } from "@/components/button";
import PersonLink from "@/components/domain/profile/PersonLink";
import SemesterBadge from "@/components/domain/productions/SemesterBadge";
import { formatNiceListFromArray } from "@/helpers";
import { MaskIcon } from "@/theme/MaskIcon";
import { Prisma } from "@prisma/client";

const metaIconClassName = "h-4 w-4 flex-none bg-[var(--app-text)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]";

type PresentationWithPresenters = Prisma.PresentationGetPayload<{
  include: {
    presenters: {
      select: {
        id: true;
        name: true;
        image: true;
      };
    };
    production: {
      select: {
        thursday_id: true;
        thursday: {
          select: {
            semester: {
              select: {
                name: true;
              };
            };
          };
        };
      };
    };
  };
}>;

interface PresentationCardProps {
  presentation: PresentationWithPresenters;
  isUserProfile?: boolean;
}

export default function PresentationCard({
  presentation,
  isUserProfile = false,
}: PresentationCardProps) {
  const authors = (presentation.presenters || []).map((author) => (
    isUserProfile ? (
      <span key={`author.id:${author.id}`}>{author.name}</span>
    ) : (
      <PersonLink
        key={`author.id:${author.id}`}
        userId={author.id}
        className="text-inherit! no-underline underline-offset-[0.14em] hover:text-[var(--brand-color)]! hover:underline"
      >
        {author.name}
      </PersonLink>
    )
  ));

  const thursdayId = (presentation as any).production?.thursday_id;
  const semesterName = (presentation as any).production?.thursday?.semester?.name;
  const thursdayDate = (presentation as any).production?.thursday?.date;
  const formattedDate = thursdayDate
    ? new Date(thursdayDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;

  if (!isUserProfile) {
    return (
      <div className="my-3 grid w-full grid-cols-1 items-baseline gap-1 text-inherit no-underline min-[768px]:grid-cols-[minmax(10rem,14rem)_minmax(0,1fr)] min-[768px]:gap-4">
        <div className="flex min-w-0 flex-col gap-1 leading-[1.4]">
          <div>{presentation.name}</div>
        </div>
        <div className="flex min-w-0 flex-col gap-[0.35rem]">
          {presentation.about !== "" ? (
            <div><i>{presentation.about}</i></div>
          ) : null}
          <div className="flex flex-col gap-1">
            <b>Presenters</b>
            {authors.length > 0 ? (
              <div className="flex flex-wrap gap-x-1 gap-y-0">{formatNiceListFromArray(authors)}</div>
            ) : (
              <div>No one is credited yet.</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-2 rounded-xl bg-[var(--app-subtle)] p-4 pt-5">
      <SemesterBadge name={semesterName} />
      <div className="font-bold">{presentation.name}</div>
      <div className="flex w-full flex-row flex-wrap items-baseline gap-x-4 gap-y-2 [&_div]:m-0">
        {presentation.about !== "" ? (
          <div><i>{presentation.about}</i></div>
        ) : null}
        {authors.length > 0 ? (
          <div className="flex flex-wrap gap-x-1 gap-y-0">{formatNiceListFromArray(authors)}</div>
        ) : (
          <div>No one is credited as an author of this presentation yet.</div>
        )}
      </div>
      {formattedDate && (
        <div className="flex items-center gap-1.5">
          <MaskIcon icon="day/day.svg" className={metaIconClassName} />
          {formattedDate}
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

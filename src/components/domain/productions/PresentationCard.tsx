import Link from "next/link";
import PersonLink from "@/components/domain/profile/PersonLink";
import SemesterBadge from "@/components/domain/productions/SemesterBadge";
import { formatNiceListFromArray } from "@/helpers";
import { MaskIcon } from "@/theme/MaskIcon";
import { Prisma } from "@prisma/client";
import { formatShortMonthDayYear } from "@/constants/date-format";

const metaIconClassName = "h-4 w-4 flex-none bg-[var(--app-text)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]";
const viewArrowIconClassName = "h-4 w-4 flex-none bg-[var(--app-text)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]";

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
  const formattedDate = formatShortMonthDayYear(thursdayDate);

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
          <div className="flex flex-col gap-[0.4rem]">
            <span className="ui-label">Presenters</span>
            {authors.length > 0 ? (
              <div className="mt-1 flex flex-wrap gap-x-1 gap-y-0">{formatNiceListFromArray(authors)}</div>
            ) : (
              <div className="mt-1">No one is credited yet.</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const cardContent = (
    <>
      <SemesterBadge name={semesterName} />
      <h4 className="m-0">{presentation.name}</h4>
      <div className="mt-1 flex w-full flex-row flex-wrap items-baseline gap-x-4 gap-y-2 [&_div]:m-0">
        {presentation.about !== "" ? (
          <div><i>{presentation.about}</i></div>
        ) : null}
        {authors.length > 0 ? (
          <div className="flex items-center gap-1.5 text-[var(--subtle-text)]">
            <MaskIcon icon="person/person.svg" className={metaIconClassName} />
            <div className="flex flex-wrap gap-x-1 gap-y-0">{formatNiceListFromArray(authors)}</div>
          </div>
        ) : (
          <div>No one is credited as an author of this presentation yet.</div>
        )}
      </div>
      {formattedDate && (
        <div className="flex items-center gap-1.5 text-[var(--subtle-text)]">
          <MaskIcon icon="day/day.svg" className={metaIconClassName} />
          {formattedDate}
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

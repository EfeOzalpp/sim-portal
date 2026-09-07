import { Button } from "@/components/button";
import PersonLink from "@/components/domain/profile/PersonLink";
import { formatNiceListFromArray } from "@/helpers";
import { Prisma } from "@prisma/client";

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

  if (!isUserProfile) {
    return (
      <div className="my-3 grid w-full grid-cols-1 items-baseline gap-1 text-inherit no-underline min-[768px]:grid-cols-[minmax(10rem,14rem)_minmax(0,1fr)] min-[768px]:gap-4">
        <div className="flex min-w-0 flex-col gap-1 leading-[1.4]">
          <b>Name</b>
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
    <div className="flex w-full flex-col gap-2 rounded-md border border-solid border-[var(--app-border)] bg-[var(--app-secondary)] p-2 pt-3">
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

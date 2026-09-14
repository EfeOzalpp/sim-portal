// React & Next.js
import type { MouseEventHandler } from "react";

// Components
import Block from "@/components/primitives/Block";
import FaceImage from "@/components/primitives/FaceImage";

// Helpers
import type { User } from "@prisma/client";

interface UserCardProps {
  user: Pick<User, "id" | "name" | "image" | "role" | "pronouns">;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

export default function UserCard({ user, onClick }: UserCardProps) {
  const pronouns = user.pronouns?.trim();

  return (
    <Block
      as="a"
      href={`/users?profileUserId=${user.id}`}
      className="group block h-full w-full overflow-hidden rounded-lg bg-[var(--elevated-surface)] p-0 text-[var(--app-text)] no-underline print:border! print:border-[#222]! print:text-[#111] print:shadow-none! print:[transform:none]!"
      onClick={onClick}
      data-action-mode-target="user-card"
    >
      {/* rounded-lg belongs here, not UserCardGrid's [&>*]:rounded-lg - that only reaches Block's wrapper <div>, which has no overflow-hidden to clip with. */}
      <div className="relative flex h-full w-full flex-col overflow-hidden bg-[var(--elevated-surface)] group-hover:bg-[var(--elevated-surface-hover)] group-focus-visible:bg-[var(--elevated-surface-hover)]">
        <div className="relative aspect-square w-full min-h-0 flex-1 overflow-hidden rounded-b-sm border-b border-b-[var(--elevated-surface-border)] print:aspect-square print:h-auto print:flex-none print:border-b-0">
          <FaceImage
            imagePath={user.image}
            alt={`${user.name}'s face`}
            sizes="(max-width: 600px) calc(50vw - 1rem), (max-width: 1000px) calc(33vw - 1rem), 12rem"
            style={{ objectFit: "cover" }}
            loading="eager"
          />
        </div>
        <div className="flex flex-none flex-col items-start justify-start gap-1.5 pt-3 pr-2 pb-5 pl-6 text-left print:min-h-[0.23in] print:px-[0.045in] print:py-[0.035in]">
          <h4 className="m-0 break-words font-medium text-[var(--app-text)] print:text-[6.5pt] print:leading-[1.1]">
            {user.name}
          </h4>
          {pronouns && (
            <p className="m-0 text-[var(--subtle-text)] print:text-[5.5pt]">{pronouns}</p>
          )}
        </div>
        <span
          className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center text-[var(--app-card-action-icon)] opacity-0"
          data-user-action-overlay
          aria-hidden="true"
        >
          <span className="h-7 w-7 origin-center scale-100 bg-current [mask-image:var(--user-card-action-icon)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]" />
        </span>
      </div>
    </Block>
  );
}

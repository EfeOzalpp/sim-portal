// React & Next.js
import type { MouseEventHandler } from "react";

// Components
import Block from "@/components/primitives/Block";
import Button from "@/components/button";
import FaceImage from "@/components/primitives/FaceImage";

// Helpers
import type { User } from "@prisma/client";

interface UserCardProps {
  user: Pick<User, "id" | "name" | "image" | "role" | "pronouns">;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function UserCard({ user, onClick, onEdit, onDelete }: UserCardProps) {
  const pronouns = user.pronouns?.trim();

  return (
    <Block
      as="a"
      href={`/users?profileUserId=${user.id}`}
      className="group relative border border-[var(--elevated-surface-border)] block h-full w-full overflow-hidden rounded-lg bg-[var(--elevated-surface)] p-0 text-[var(--app-text)] no-underline print:border! print:border-[#222]! print:text-[#111] print:shadow-none! print:[transform:none]!"
      onClick={onClick}
      data-action-mode-target="user-card"
    >
      {/* rounded-lg belongs here, not UserCardGrid's [&>*]:rounded-lg - that only reaches Block's wrapper <div>, which has no overflow-hidden to clip with. */}
      <div className="relative flex h-full w-full flex-col overflow-hidden bg-[var(--elevated-surface)] group-hover:bg-[var(--elevated-surface-hover)] group-focus-visible:bg-[var(--elevated-surface-hover)]">
        <div className="relative aspect-square w-full min-h-0 flex-1 overflow-hidden rounded-b-sm print:aspect-square print:h-auto print:flex-none print:border-b-0">
          <FaceImage
            imagePath={user.image}
            alt={`${user.name}'s face`}
            sizes="(max-width: 600px) calc(50vw - 1rem), (max-width: 1000px) calc(33vw - 1rem), 12rem"
            style={{ objectFit: "cover" }}
            loading="eager"
          />
        </div>
        {/* min-h reserves the same 2-line height every card gets, pronouns or
            not - otherwise the grid row stretches every card to match
            whichever one's tallest, skewing the photo's own aspect ratio.
            Without pronouns, the name centers into that reserved height
            instead of an invisible second line pinning it to the top. */}
        <div
          className={`flex min-h-[3.25rem] min-w-0 flex-none flex-col ${pronouns ? "justify-start" : "justify-center"} items-start gap-1 pt-2.5 pr-2 pb-3.5 pl-4 text-left print:min-h-[0.3in] print:px-[0.08in] print:py-[0.06in]`}
        >
          <p
            className="m-0 w-full truncate font-medium text-[var(--app-text)] print:text-[6.5pt] print:leading-[1.1] print:text-[#111]!"
            title={user.name}
          >
            {user.name}
          </p>
          {pronouns && (
            <p className="m-0 text-[var(--subtle-text)] print:text-[5.5pt] print:text-[#444]!">{pronouns}</p>
          )}
        </div>
        <span
          className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center text-[var(--app-card-action-icon)] opacity-0"
          data-user-action-overlay
          aria-hidden="true"
        >
          <span className="h-7 w-7 origin-center scale-100 bg-current [mask-image:var(--user-card-action-icon)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]" />
        </span>
        {(onEdit || onDelete) && (
          <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 print:hidden [--button-bg:var(--button-overlay-bg)] [--button-bg-hover:var(--button-overlay-bg-hover)]">
            {onEdit && (
              <Button
                variant="icon"
                icon="edit/edit.svg"
                aria-label={`Edit ${user.name}`}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onEdit();
                }}
              />
            )}
            {onDelete && (
              <Button
                variant="icon"
                tone="danger"
                icon="delete/delete.svg"
                aria-label={`Delete ${user.name}`}
                className="[--button-bg-hover:var(--button-delete-overlay-bg-hover)]"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onDelete();
                }}
              />
            )}
          </div>
        )}
      </div>
    </Block>
  );
}

// React & Next.js
import type { MouseEventHandler } from "react";
import Link from "next/link";

// Components
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
    <Link
      href={`/users?profileUserId=${user.id}`}
      className="group relative block h-full w-full rounded-md p-0 text-[var(--app-text)] no-underline print:border! print:border-[#222]! print:text-[#111] print:shadow-none! print:[transform:none]!"
      onClick={onClick}
      data-action-mode-target="user-card"
    >
      <div className="relative flex h-full w-full flex-col">
        <div className="relative aspect-square w-full flex-none overflow-hidden rounded-md bg-[var(--elevated-surface)] transition-[filter] group-hover:brightness-110 group-focus-visible:brightness-110 print:h-auto print:rounded-none">
          <FaceImage
            imagePath={user.image}
            alt={`${user.name}'s face`}
            sizes="(max-width: 600px) calc(50vw - 1rem), (max-width: 1000px) calc(33vw - 1rem), 12rem"
            style={{ objectFit: "cover" }}
            loading="eager"
          />
        </div>
        <div className="flex h-[3.375rem] min-w-0 flex-none flex-col items-start justify-start gap-0 pt-1.5 pr-1 text-left print:h-auto print:min-h-[0.3in] print:px-[0.08in] print:py-[0.06in]">
          <p
            className="is-body m-0 w-full truncate font-medium text-[var(--app-text)] print:text-[6.5pt] print:leading-[1.1] print:text-[#111]!"
            title={user.name}
          >
            {user.name}
          </p>
          {pronouns && (
            <p className="is-body m-0 text-[var(--subtle-text)] print:text-[5.5pt] print:text-[#444]!">{pronouns}</p>
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
          <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 print:hidden [--page-icon-bg:var(--button-overlay-bg)] [--page-icon-shadow:var(--button-overlay-shadow)] [--page-icon-bg-hover:var(--button-overlay-bg-hover)]">
            {onEdit && (
              <Button
                surface="page"
                variant="tool"
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
                surface="page"
                variant="tool"
                tone="danger"
                icon="delete/delete.svg"
                aria-label={`Delete ${user.name}`}
                className="[--page-icon-bg-hover:var(--button-delete-overlay-bg-hover)] [--button-danger-icon-text:var(--button-delete-overlay-text)]"
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
    </Link>
  );
}

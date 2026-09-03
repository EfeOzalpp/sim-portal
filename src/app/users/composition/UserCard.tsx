import Block from "@/components/primitives/Block";
import Image from "next/image";
import type { MouseEventHandler } from "react";
import { normalizeFaceImagePath } from "@/helpers";

import type { User } from "@prisma/client";

interface UserCardProps {
  user: Pick<User, "id" | "name" | "image" | "role">;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

export default function UserCard({ user, onClick }: UserCardProps) {
  return (
    <Block
      as="a"
      href={`/users?profileUserId=${user.id}`}
      className="group block h-full w-full overflow-hidden rounded-[var(--border-md)] bg-[var(--app-card-bg)] p-0 text-[var(--app-text)] no-underline print:h-auto print:border! print:border-[#222]! print:text-[#111] print:shadow-none! print:[transform:none]!"
      onClick={onClick}
      data-action-mode-target="user-card"
    >
      <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[var(--border-md)] bg-[var(--app-card-bg)] group-hover:bg-[var(--app-card-bg-hover)] group-focus-visible:bg-[var(--app-card-bg-hover)] print:rounded-none">
        <div className="relative h-[12.6rem] w-full overflow-hidden print:h-auto print:aspect-square">
          <Image
            src={normalizeFaceImagePath(user.image)}
            alt={`${user.name}'s face`}
            fill
            sizes="(max-width: 600px) calc(50vw - 1rem), (max-width: 1000px) calc(33vw - 1rem), 12rem"
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className="flex min-h-12 items-center justify-center px-2 py-[0.4rem] text-center print:min-h-[0.23in] print:px-[0.045in] print:py-[0.035in]">
          <h4 className="m-0 break-words font-medium text-[var(--app-text)] print:text-[6.5pt] print:leading-[1.1]">
            {user.name}
          </h4>
        </div>
        <span
          className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center bg-[var(--app-card-action-overlay)] text-[var(--app-card-action-icon)] opacity-0"
          data-user-action-overlay
          aria-hidden="true"
        >
          <span className="h-[var(--svg-size-lg)] w-[var(--svg-size-lg)] origin-center scale-100 bg-current [mask-image:var(--user-card-action-icon)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]" />
        </span>
      </div>
    </Block>
  );
}

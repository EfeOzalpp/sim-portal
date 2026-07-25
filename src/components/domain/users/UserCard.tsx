import Block from "@/components/primitives/Block";
import Image from "next/image";
import type { MouseEventHandler } from "react";
import styles from "@/components/domain/users/UserCard.module.css";
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
      className={styles.UserCard}
      onClick={onClick}
      data-action-mode-target="user-card"
    >
      <div className={styles.cardInner}>
        <div className={styles.imageSection}>
          <Image
            src={normalizeFaceImagePath(user.image)}
            alt={`${user.name}'s face`}
            fill
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className={styles.nameSection}>
          <h4 className={styles.name}>{user.name}</h4>
        </div>
        <span className={styles.actionOverlay} data-user-action-overlay aria-hidden="true">
          <span className={styles.actionOverlayIcon} />
        </span>
      </div>
    </Block>
  );
}

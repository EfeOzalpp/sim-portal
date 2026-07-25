"use client";

import { MouseEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { User } from "@prisma/client";
import { useActionMode } from "@/components/layout/ActionMode";
import styles from "@/components/domain/users/Users.module.css";
import UserCard from "@/components/domain/users/UserCard";

interface UserCardGridProps {
	users: Pick<User, "id" | "name" | "image" | "role">[];
}

export default function UserCardGrid({ users }: UserCardGridProps) {
	const { activeMode } = useActionMode();
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	function openUserModal(userId: string, modalParam: "editUserId" | "profileUserId" | "deleteUserId") {
		const params = new URLSearchParams(searchParams.toString());
		params.delete("editUserId");
		params.delete("profileUserId");
		params.delete("deleteUserId");
		params.set(modalParam, userId);
		router.push(`${pathname}?${params.toString()}`, { scroll: false });
	}

	return (
		<div className={styles.UsersGrid}>
			{users.map((user) => (
				<UserCard
					key={user.id}
					user={user}
					onClick={(event: MouseEvent<HTMLAnchorElement>) => {
						if (activeMode === "edit-users") {
							event.preventDefault();
							openUserModal(user.id, "editUserId");
							return;
						}

						if (activeMode === "delete-users") {
							event.preventDefault();
							openUserModal(user.id, "deleteUserId");
							return;
						}

						if (
							event.button === 0 &&
							!event.metaKey &&
							!event.ctrlKey &&
							!event.shiftKey &&
							!event.altKey
						) {
							event.preventDefault();
							openUserModal(user.id, "profileUserId");
						}
					}}
				/>
			))}
		</div>
	);
}

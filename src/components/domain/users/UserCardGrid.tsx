"use client";

import { MouseEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { User } from "@prisma/client";
import { useActionMode } from "@/components/layout/ActionMode";
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
		<div className="grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] justify-center gap-[var(--spacing-sm)] bg-[var(--app-surface)] px-[var(--spacing-sm)] pb-[var(--spacing-lg)] [&>*]:min-w-0 [&>*]:w-full [&>*]:rounded-[var(--border-md)] [&>*]:border-solid [&>*]:border-[var(--app-border)] [&>*]:bg-[var(--app-card-bg)] [&>*]:[border-width:var(--app-border-width)] print:grid-cols-[repeat(10,minmax(0,1fr))] print:justify-stretch print:gap-[0.06in] print:bg-white print:p-0 print:text-black print:[&>*]:break-inside-avoid print:[&>*]:border-[#ccc]! print:[&>*]:bg-white! print:[&>*]:[page-break-inside:avoid] print:[&_a]:text-inherit print:[&_a]:no-underline">
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

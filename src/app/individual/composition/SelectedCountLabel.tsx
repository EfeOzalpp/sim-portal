"use client";

import clsx from "clsx";
import { useSelectedUsers } from "@/app/individual/composition/SelectedUsersProvider";

export default function SelectedCountLabel() {
	const { selectedUserIds } = useSelectedUsers();
	const count = selectedUserIds.size;

	return (
		<span className={clsx("text-sm", count === 0 ? "text-[var(--content-muted)]" : "text-[var(--app-text)]")}>
			{count} selected
		</span>
	);
}

"use client";

import clsx from "clsx";
import { useSelectedUsers } from "@/app/individual/composition/selection/SelectedUsersProvider";

export default function SelectedCountLabel() {
	const { selectedUserIds } = useSelectedUsers();
	const count = selectedUserIds.size;

	return (
		<span className={clsx("inline-flex flex-none items-center gap-1 whitespace-nowrap", count === 0 && "opacity-55")}>
			<span className="min-w-[2ch] text-right tabular-nums">{count}</span>
			selected
		</span>
	);
}

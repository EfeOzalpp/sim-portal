"use client";

import clsx from "clsx";
import { useSelectedThursdays } from "@/app/thursdays/composition/SelectedThursdaysProvider";

export default function SelectedThursdaysCountLabel() {
	const { selectedThursdayIds } = useSelectedThursdays();
	const count = selectedThursdayIds.size;

	return (
		<span className={clsx("inline-flex flex-none items-center gap-1 whitespace-nowrap text-sm font-semibold text-[var(--page-bar-label,var(--app-text))]", count === 0 && "opacity-55")}>
			<span className="min-w-[2ch] text-right tabular-nums">{count}</span>
			selected
		</span>
	);
}

"use client";

import clsx from "clsx";
import { useSelectedThursdays } from "@/app/thursdays/composition/SelectedThursdaysProvider";

export default function SelectedThursdaysCountLabel() {
	const { selectedThursdayIds } = useSelectedThursdays();
	const count = selectedThursdayIds.size;

	return (
		<span className={clsx("text-sm", count === 0 ? "text-[var(--content-muted)]" : "text-[var(--app-text)]")}>
			{count} selected
		</span>
	);
}

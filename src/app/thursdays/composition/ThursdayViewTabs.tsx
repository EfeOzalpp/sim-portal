"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import clsx from "clsx";
import { MaskIcon } from "@/theme/MaskIcon";
import type { IconName } from "@/theme/icons";
import { ThursdayCheckbox, useSelectedThursdays } from "@/app/thursdays/composition/SelectedThursdaysProvider";
import styles from "@/app/thursdays/composition/ThursdayViewTabs.module.css";

type ThursdayView = "grid" | "list";

const tabs: { value: ThursdayView; label: string; icon: IconName }[] = [
	{ value: "grid", label: "Grid", icon: "grid_view/grid_view.svg" },
	{ value: "list", label: "List", icon: "list/list.svg" },
];

export default function ThursdayViewTabs({ thursdayIds, activeView }: { thursdayIds: string[]; activeView: ThursdayView }) {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const { selectedThursdayIds, setSelectedThursdayIds } = useSelectedThursdays();
	const selectedCount = thursdayIds.filter((id) => selectedThursdayIds.has(id)).length;
	const allSelected = thursdayIds.length > 0 && selectedCount === thursdayIds.length;
	const someSelected = selectedCount > 0 && !allSelected;

	function getViewHref(view: ThursdayView) {
		const params = new URLSearchParams(searchParams.toString());
		params.set("view", view);
		return `${pathname}?${params.toString()}`;
	}

	return (
		<div className={clsx(styles.tabs, "group print:hidden")}>
			<div className={styles.masterCheckbox}>
				<ThursdayCheckbox
					checked={allSelected}
					indeterminate={someSelected}
					ariaLabel="Select all thursdays"
					onChange={() => setSelectedThursdayIds(allSelected ? new Set() : new Set(thursdayIds))}
				/>
			</div>
			<div className={styles.tabList} role="tablist" aria-label="Thursday view">
				{tabs.map((tab) => {
					const isActive = activeView === tab.value;

					return (
						<Link
							key={tab.value}
							role="tab"
							aria-selected={isActive}
							href={getViewHref(tab.value)}
							scroll={false}
							className={clsx("ui-label", styles.tab, isActive && styles.tabActive)}
						>
							<MaskIcon icon={tab.icon} className={styles.icon} />
							<span>{tab.label}</span>
						</Link>
					);
				})}
			</div>
		</div>
	);
}

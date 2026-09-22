"use client";

import { useState } from "react";
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

export default function ThursdayViewTabs({ thursdayIds }: { thursdayIds: string[] }) {
	const [activeView, setActiveView] = useState<ThursdayView>("list");
	const { selectedThursdayIds, setSelectedThursdayIds } = useSelectedThursdays();
	const selectedCount = thursdayIds.filter((id) => selectedThursdayIds.has(id)).length;
	const allSelected = thursdayIds.length > 0 && selectedCount === thursdayIds.length;
	const someSelected = selectedCount > 0 && !allSelected;

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
						<button
							key={tab.value}
							type="button"
							role="tab"
							aria-selected={isActive}
							className={clsx("ui-label", styles.tab, isActive && styles.tabActive)}
							onClick={() => setActiveView(tab.value)}
						>
							<MaskIcon icon={tab.icon} className={styles.icon} />
							<span>{tab.label}</span>
						</button>
					);
				})}
			</div>
		</div>
	);
}

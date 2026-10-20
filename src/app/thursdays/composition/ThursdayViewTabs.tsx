"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { usePathname, useSearchParams } from "next/navigation";
import clsx from "clsx";
import { useIsMobile } from "@/components/layout/breakpoints";
import { usePageChrome } from "@/components/layout/PageChrome";
import { pageChromeSlotIds, usePageChromeSlotTarget } from "@/components/layout/PageChrome/slots";
import { MaskIcon } from "@/theme/MaskIcon";
import type { IconName } from "@/theme/icons";
import { ThursdayCheckbox, useSelectedThursdays } from "@/app/thursdays/composition/selection/SelectedThursdaysProvider";
import styles from "@/app/thursdays/composition/ThursdayViewTabs.module.css";

type ThursdayView = "grid" | "list";

const tabs: { value: ThursdayView; label: string; icon: IconName }[] = [
	{ value: "grid", label: "Grid", icon: "grid/grid_on.svg" },
	{ value: "list", label: "List", icon: "list/list.svg" },
];

export default function ThursdayViewTabs({ thursdayIds, activeView }: { thursdayIds: string[]; activeView: ThursdayView }) {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const isMobile = useIsMobile();
	const { isBarMinimized } = usePageChrome();
	const mobileToolsTarget = usePageChromeSlotTarget(pageChromeSlotIds.mobileBarTools);
	const barToolsTarget = usePageChromeSlotTarget(pageChromeSlotIds.barTools);
	const inBar = !isMobile && !isBarMinimized && Boolean(barToolsTarget);
	const { selectedThursdayIds, setSelectedThursdayIds } = useSelectedThursdays();
	const selectedCount = thursdayIds.filter((id) => selectedThursdayIds.has(id)).length;
	const allSelected = thursdayIds.length > 0 && selectedCount === thursdayIds.length;
	const someSelected = selectedCount > 0 && !allSelected;

	function getViewHref(view: ThursdayView) {
		const params = new URLSearchParams(searchParams.toString());
		params.set("view", view);
		return `${pathname}?${params.toString()}`;
	}

	const controls = (
		<div className={clsx(styles.tabs, isMobile && styles.chromeTabs, inBar && styles.barTabs, "group print:hidden")}>
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

	if (isMobile) return mobileToolsTarget ? createPortal(controls, mobileToolsTarget) : null;
	if (inBar && barToolsTarget) return createPortal(controls, barToolsTarget);

	return <div className={styles.contentControls}>{controls}</div>;
}

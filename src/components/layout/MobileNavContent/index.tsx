"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import styles from "@/components/layout/MobileNavContent/MobileNavContent.module.css";

interface MobileNavContentProps {
	filterContent?: ReactNode;
	mobileManageContent?: ReactNode;
	printContent?: ReactNode;
}

export default function MobileNavContent({
	filterContent,
	mobileManageContent,
	printContent,
}: MobileNavContentProps) {
	type Panel = "filter" | "manage" | null;
	const [activePanel, setActivePanel] = useState<Panel>(null);

	const hasFilter = !!filterContent;
	const hasManage = !!(mobileManageContent || printContent);

	function togglePanel(panel: Panel) {
		setActivePanel((prev) => (prev === panel ? null : panel));
	}

	return (
		<div className={styles.root} data-mobile-content-bar>
			{/* Toggle buttons */}
			<div className={styles.toggleBar}>
				{hasFilter && (
					<button
						className={`ui-label ${styles.toggleBtn} ${activePanel === "filter" ? styles.toggleBtnActive : ""}`}
						onClick={() => togglePanel("filter")}
						aria-expanded={activePanel === "filter"}
					>
						<span className={`${styles.toggleBtnIcon} ${styles.searchIcon}`} aria-hidden="true" />
						Search & Filter
					</button>
				)}
				{hasManage && (
					<button
						className={`ui-label ${styles.toggleBtn} ${activePanel === "manage" ? styles.toggleBtnActive : ""}`}
						onClick={() => togglePanel("manage")}
						aria-expanded={activePanel === "manage"}
					>
						<span className={`${styles.toggleBtnIcon} ${styles.manageIcon}`} aria-hidden="true" />
						Manage
					</button>
				)}
			</div>

			{/* Manage panel: inline, reserves space */}
			{activePanel === "manage" && (
				<div className={styles.manageBar}>
					<div className={styles.manageActions}>
						{mobileManageContent}
						{printContent && (
							<div className={styles.printSlot}>{printContent}</div>
						)}
					</div>
				</div>
			)}

			{/* Filter panel: inline, reserves space */}
			{activePanel === "filter" && (
				<div className={styles.filterPopup}>
					<div className={styles.filterFields}>
						{filterContent}
					</div>
				</div>
			)}
		</div>
	);
}

import clsx from "clsx";
import type { CSSProperties, ReactNode } from "react";
import styles from "@/components/layout/NavContent/NavContent.module.css";
import MobileNavContent from "@/components/layout/MobileNavContent";

export interface NavContentProps {
	start?: ReactNode;
	/** Backward-compat: free-form desktop sidebar content. Use the structured props below when possible. */
	end?: ReactNode;
	/** Filter inputs shown in the desktop sidebar section and the mobile filter popup. */
	filterContent?: ReactNode;
	/** Full-text manage buttons for the desktop sidebar (e.g. "Add User", "Edit Users"). */
	manageContent?: ReactNode;
	/** Abbreviated manage buttons for the mobile horizontal bar (e.g. "Add", "Edit", "Del"). */
	mobileManageContent?: ReactNode;
	/** Print/export button shown in the desktop sidebar and the mobile manage bar. */
	printContent?: ReactNode;
	/** Section label for the filter area in the desktop sidebar. */
	filterLabel?: string;
	/** Section label for the manage area in the desktop sidebar. */
	manageLabel?: string;
	className?: string;
	style?: CSSProperties;
	ariaLabel?: string;
}

export default function NavContent({
	start,
	end,
	filterContent,
	manageContent,
	mobileManageContent,
	printContent,
	filterLabel = "Search & Filter",
	manageLabel = "Manage",
	className,
	style,
	ariaLabel = "Content navigation",
}: NavContentProps) {
	const hasMobile = !!(filterContent || mobileManageContent);

	// Build the desktop sidebar end content from structured props when provided,
	// otherwise fall back to the free-form `end` prop for backward compat.
	const desktopEnd = (filterContent || manageContent || printContent) ? (
		<>
			{filterContent && (
				<div className={styles.navSection}>
					<span className={styles.navSectionLabel}>{filterLabel}</span>
					<div className={styles.navSectionControls}>{filterContent}</div>
				</div>
			)}
			{manageContent && (
				<div className={styles.navSection}>
					<span className={styles.navSectionLabel}>{manageLabel}</span>
					<div className={styles.navSectionControls}>{manageContent}</div>
				</div>
			)}
			{printContent && (
				<div className={styles.navSection}>
					<div className={styles.navSectionControls}>{printContent}</div>
				</div>
			)}
		</>
	) : end;

	return (
		<>
			<nav
				className={clsx(styles.root, hasMobile && styles.hasMobileBar, className)}
				style={style}
				aria-label={ariaLabel}
				data-content-nav
			>
				<div className={styles.stack}>
					{start !== undefined && start !== null && start !== false ? (
						<div className={styles.start}>{start}</div>
					) : null}
					<div className={styles.end}>{desktopEnd}</div>
				</div>
			</nav>

			{hasMobile && (
				<MobileNavContent
					filterContent={filterContent}
					mobileManageContent={mobileManageContent}
					printContent={printContent}
				/>
			)}
		</>
	);
}

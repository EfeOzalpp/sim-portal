"use client";

import type { CSSProperties, ReactNode } from "react";
import { createPortal } from "react-dom";
import { useIsMobile } from "@/components/layout/breakpoints";
import { getStringColors } from "@/constants/stringColors";
import PageMoreMenu, { type PageMoreMenuItem } from "@/components/layout/PageChrome/PageMoreMenu";
import MobilePageSearch from "@/components/layout/PageChrome/MobilePageSearch";
import { usePageChrome } from "./index";
import { pageChromeSlotIds as slotIds, usePageChromeSlotTarget, type PageChromeSlotId } from "./slots";
import styles from "@/components/layout/PageChrome/PageChrome.module.css";

function SlotPortal({ id, children }: { id: PageChromeSlotId; children: ReactNode }) {
	const target = usePageChromeSlotTarget(id);
	if (!target) return null;

	return createPortal(children, target);
}

interface PageChromeProps {
	title: string;
	/** Keep the title in the mobile top row without a separate actions row. */
	mobileLayout?: "expandable" | "title-only";
	/** Page-wide scope picker, e.g. the semester select. */
	scope?: ReactNode;
	search?: ReactNode;
	desktopSearchWidth?: CSSProperties["width"];
	/** Page-level command buttons (add/edit/delete). */
	actions?: ReactNode;
	/** More page-level command buttons, placed after `actions`. */
	trailingActions?: ReactNode;
	/** View controls tied to the content (grid view, scope pill, counts that sit with them). */
	tools?: ReactNode;
	/** Display controls follow the count/menu on desktop and filters on mobile. */
	viewControls?: ReactNode;
	/** Status text labels the menu trigger when page utilities are available. */
	status?: ReactNode;
	tabs?: ReactNode;
	/** Adds an export/print item with this label to the page's "more" menu. */
	printLabel?: string;
	csvLabel?: string;
	/** Infrequent page actions, listed in the "more" menu. */
	utilities?: PageMoreMenuItem[];
}

export default function PageChrome({ title, mobileLayout = "expandable", scope, search, desktopSearchWidth, actions, trailingActions, tools, viewControls, status, tabs, printLabel, csvLabel, utilities }: PageChromeProps) {
	const isMobile = useIsMobile();
	const { isCollapsed } = usePageChrome();
	const statusSlot = isMobile ? (isCollapsed ? slotIds.mobileCollapsedStatus : slotIds.mobileStatus) : slotIds.barStatus;
	const moreSlot = status || isMobile ? statusSlot : slotIds.barTools;
	const hasMenu = Boolean(utilities?.length || printLabel || csvLabel);
	const actionsSlot = isMobile ? (isCollapsed ? slotIds.mobileBarActions : slotIds.mobileActions) : slotIds.barActions;
	const titleStyle = { "--page-title-hash-color": getStringColors(title).title } as CSSProperties;

	return (
		<>
			<SlotPortal id={slotIds.desktopTitle}>
				<h2 className={`desktop-page-title ${styles.desktopTitle}`} style={titleStyle}>{title}</h2>
			</SlotPortal>
			{mobileLayout === "title-only" ? (
				<SlotPortal id={slotIds.mobileTopTitle}>
					<h2 className={`mobile-top-page-title ${styles.mobileTitle}`} style={titleStyle} data-mobile-title-only>{title}</h2>
				</SlotPortal>
			) : (
				<>
					<SlotPortal id={slotIds.mobileTitle}>
						<h2 className={`mobile-page-title ${styles.mobileTitle}`} style={titleStyle}>{title}</h2>
					</SlotPortal>
					<SlotPortal id={slotIds.mobileCollapsedTitle}>
						<h2 className={`mobile-collapsed-page-title ${styles.mobileTitle}`} style={titleStyle}>{title}</h2>
					</SlotPortal>
				</>
			)}
			{scope && (
				<SlotPortal id={isMobile ? slotIds.mobileFilter : slotIds.desktopScope}>
					{isMobile ? scope : <div className={styles.desktopScope}>{scope}</div>}
				</SlotPortal>
			)}
			{search && (
				<SlotPortal id={isMobile ? slotIds.mobileSearch : slotIds.desktopControls}>
					{isMobile ? <MobilePageSearch>{search}</MobilePageSearch> : (
						<div className={styles.desktopSearch} style={desktopSearchWidth ? { width: desktopSearchWidth } : undefined}>{search}</div>
					)}
				</SlotPortal>
			)}
			{actions && <SlotPortal id={actionsSlot}>{actions}</SlotPortal>}
			{trailingActions && <SlotPortal id={actionsSlot}>{trailingActions}</SlotPortal>}
			{tools && <SlotPortal id={isMobile ? slotIds.mobileBarTools : slotIds.barTools}>{tools}</SlotPortal>}
			{status && !hasMenu && <SlotPortal id={statusSlot}>{status}</SlotPortal>}
			{tabs && <SlotPortal id={slotIds.barTabs}>{tabs}</SlotPortal>}
			{hasMenu && (
				<SlotPortal id={moreSlot}>
					<PageMoreMenu status={status} items={utilities} printLabel={printLabel} csvLabel={csvLabel} />
				</SlotPortal>
			)}
			{viewControls && (
				<SlotPortal id={isMobile ? slotIds.mobileBarTools : slotIds.barStatus}>
					{isMobile ? viewControls : <div className={styles.viewControls}>{viewControls}</div>}
				</SlotPortal>
			)}
		</>
	);
}

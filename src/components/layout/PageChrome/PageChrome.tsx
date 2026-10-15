"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useIsMobile } from "@/components/layout/breakpoints";
import PageMoreMenu, { type PageMoreMenuItem } from "@/components/layout/PageChrome/PageMoreMenu";
import styles from "@/components/layout/PageChrome/PageChrome.module.css";

const slotIds = {
	desktopTitle: "page-chrome-title-slot",
	desktopScope: "page-chrome-scope-slot",
	desktopControls: "page-chrome-controls-slot",
	mobileTitle: "mobile-page-title-slot",
	mobileCollapsedTitle: "mobile-page-collapsed-title-slot",
	mobileFilter: "mobile-page-filter-slot",
	barSearch: "page-bar-search",
	barTools: "page-bar-tools",
	barStatus: "page-bar-status",
	barActions: "page-bar-actions",
	barTabs: "page-bar-tabs",
} as const;

type SlotId = (typeof slotIds)[keyof typeof slotIds];

function SlotPortal({ id, children }: { id: SlotId; children: ReactNode }) {
	const [target, setTarget] = useState<HTMLElement | null>(null);

	useEffect(() => {
		setTarget(document.getElementById(id));
	}, [id]);

	if (!target) return null;

	return createPortal(children, target);
}

interface PageChromeProps {
	title: string;
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
	/** Read-only status text such as a selected count. */
	status?: ReactNode;
	tabs?: ReactNode;
	/** Adds an export/print item with this label to the page's "more" menu. */
	printLabel?: string;
	csvLabel?: string;
	/** Infrequent page actions, listed in the "more" menu. */
	utilities?: PageMoreMenuItem[];
}

export default function PageChrome({ title, scope, search, desktopSearchWidth, actions, trailingActions, tools, status, tabs, printLabel, csvLabel, utilities }: PageChromeProps) {
	const isMobile = useIsMobile();
	const searchInMobileFilter = !scope && !!search;

	const searchSlot: SlotId = !isMobile
		? slotIds.desktopControls
		: searchInMobileFilter
			? slotIds.mobileFilter
			: slotIds.barSearch;
	const searchClassName = !isMobile ? styles.desktopSearch : searchInMobileFilter ? styles.mobileFilter : styles.barSearch;

	return (
		<>
			<SlotPortal id={slotIds.desktopTitle}>
				<h2 className={styles.desktopTitle}>{title}</h2>
			</SlotPortal>
			<SlotPortal id={slotIds.mobileTitle}>
				<h2 className={`mobile-page-title ${styles.mobileTitle}`}>{title}</h2>
			</SlotPortal>
			<SlotPortal id={slotIds.mobileCollapsedTitle}>
				<h2 className={`mobile-collapsed-page-title ${styles.mobileTitle}`}>{title}</h2>
			</SlotPortal>
			{!scope && !search && (
				<SlotPortal id={slotIds.mobileFilter}>
					<h2 className={`mobile-page-title ${styles.mobileTitle}`}>{title}</h2>
				</SlotPortal>
			)}
			{scope && (
				<SlotPortal id={isMobile ? slotIds.mobileFilter : slotIds.desktopScope}>
					<div className={isMobile ? styles.mobileFilter : styles.desktopScope}>{scope}</div>
				</SlotPortal>
			)}
			{search && (
				<SlotPortal id={searchSlot}>
					<div className={searchClassName} style={!isMobile && desktopSearchWidth ? { width: desktopSearchWidth } : undefined}>{search}</div>
				</SlotPortal>
			)}
			{actions && <SlotPortal id={slotIds.barActions}>{actions}</SlotPortal>}
			{trailingActions && <SlotPortal id={slotIds.barActions}>{trailingActions}</SlotPortal>}
			{tools && <SlotPortal id={slotIds.barTools}>{tools}</SlotPortal>}
			{status && <SlotPortal id={slotIds.barStatus}>{status}</SlotPortal>}
			{tabs && <SlotPortal id={slotIds.barTabs}>{tabs}</SlotPortal>}
			{(utilities?.length || printLabel || csvLabel) && (
				<SlotPortal id={status ? slotIds.barStatus : slotIds.barTools}>
					<PageMoreMenu items={utilities} printLabel={printLabel} csvLabel={csvLabel} />
				</SlotPortal>
			)}
		</>
	);
}

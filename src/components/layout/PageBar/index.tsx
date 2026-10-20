"use client";

import { useEffect } from "react";
import clsx from "clsx";
import { Button } from "@/components/button";
import { actionButtonIconClassName } from "@/components/button/styles";
import { usePageChrome } from "@/components/layout/PageChrome";
import { PageChromeSlot } from "@/components/layout/PageChrome/slots";
import { useIsMobile } from "@/components/layout/breakpoints";
import { MaskIcon } from "@/theme/MaskIcon";
import { dismissPopovers } from "@/components/popover/dismiss";
import styles from "@/components/layout/PageBar/PageBar.module.css";
import chromeStyles from "@/components/layout/PageChrome/PageChrome.module.css";

const PAGE_BAR_STORAGE_KEY = "sim-page-bar";

export default function PageBar() {
	const { hasScrolled, isBarMinimized: isMinimized, setBarMinimized } = usePageChrome();
	const isMobile = useIsMobile();
	const isCompact = isMinimized && !isMobile;

	useEffect(() => {
		setBarMinimized(window.localStorage.getItem(PAGE_BAR_STORAGE_KEY) === "minimized");
	}, [setBarMinimized]);

	function toggleMinimized() {
		dismissPopovers();
		const next = !isMinimized;
		window.localStorage.setItem(PAGE_BAR_STORAGE_KEY, next ? "minimized" : "open");
		setBarMinimized(next);
	}

	if (isMobile) return null;

	return (
		<div
			className={styles.root}
			data-page-scrolled={hasScrolled || undefined}
			data-minimized={isCompact || undefined}
			data-button-compact={isCompact || undefined}
		>
			<div className={styles.actionsRow}>
				<PageChromeSlot id="page-bar-tools" className={styles.tools} />
				<PageChromeSlot id="page-bar-status" className={styles.status} />
				<PageChromeSlot id="page-bar-actions" className={clsx(styles.actions, isCompact && chromeStyles.compactActions)} data-button-compact={isCompact || undefined} />
			</div>
			<PageChromeSlot id="page-bar-tabs" className={styles.tabs} />
			<div className={styles.spacer} />
			<Button
				surface="page"
				variant="action"
				type="button"
				className={styles.toggle}
				aria-expanded={!isMinimized}
				aria-label={isCompact ? "Expand page toolbar" : undefined}
				onClick={toggleMinimized}
			>
				<MaskIcon icon="unfold_more/unfold_more.svg" className={clsx(actionButtonIconClassName, styles.toggleIcon)} />
				<MaskIcon icon="unfold_less/unfold_less.svg" className={styles.collapseIcon} />
				Collapse
			</Button>
		</div>
	);
}

"use client";

import { useEffect, useState, type CSSProperties } from "react";
import clsx from "clsx";
import { Button } from "@/components/button";
import { actionButtonIconClassName } from "@/components/button/styles";
import { usePageChrome } from "@/components/layout/PageChrome";
import { useIsMobile } from "@/components/layout/breakpoints";
import { MaskIcon } from "@/theme/MaskIcon";
import styles from "@/components/layout/PageBar/PageBar.module.css";

const PAGE_BAR_STORAGE_KEY = "sim-page-bar";

export default function PageBar() {
	const { collapseProgress, isCollapsed, hasScrolled } = usePageChrome();
	const [isMinimized, setIsMinimized] = useState(false);
	const isMobile = useIsMobile();
	const isCompact = isMinimized && !isMobile;
	const style = { "--mobile-chrome-collapse": collapseProgress } as CSSProperties;

	useEffect(() => {
		setIsMinimized(window.localStorage.getItem(PAGE_BAR_STORAGE_KEY) === "minimized");
	}, []);

	function toggleMinimized() {
		setIsMinimized((current) => {
			const next = !current;
			window.localStorage.setItem(PAGE_BAR_STORAGE_KEY, next ? "minimized" : "open");
			return next;
		});
	}

	return (
		<div
			className={styles.root}
			style={style}
			data-page-scrolled={hasScrolled || undefined}
			data-mobile-chrome-collapsed={isCollapsed || undefined}
			data-minimized={isCompact || undefined}
			data-button-compact={isCompact || undefined}
		>
			<div className={styles.actionsRow}>
				<div id="page-bar-status" className={styles.status} />
				<div id="page-bar-actions" className={styles.actions} />
			</div>
			<div className={styles.collapsible}>
				<div id="page-bar-search" className={styles.search} />
				<div id="page-bar-tools" className={styles.tools} />
			</div>
			<div id="page-bar-tabs" className={styles.tabs} />
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

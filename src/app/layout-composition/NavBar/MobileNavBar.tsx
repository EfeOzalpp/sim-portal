"use client";

import { useState, useEffect, useLayoutEffect, useRef, type CSSProperties } from "react";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import type { Session } from "next-auth";
import { Button } from "@/components/button";
import { MaskIcon } from "@/theme/MaskIcon";
import { COLLAPSED_THRESHOLD, usePageChrome } from "@/components/layout/PageChrome";
import { PageChromeSlot } from "@/components/layout/PageChrome/slots";
import { MobileOnly, useIsMobile } from "@/components/layout/breakpoints";
import NavButtonLink from "@/app/layout-composition/NavBar/links/NavButtonLink";
import UserAccountLink from "@/app/layout-composition/NavBar/links/UserAccountLink";
import ThemeSwitch from "@/app/layout-composition/NavBar/theme/ThemeSwitch";
import ColorThemePopover from "@/app/layout-composition/NavBar/theme/ColorThemePopover";
import SimHistoryLink from "@/app/layout-composition/NavBar/links/SimHistoryLink";
import navStyles from "@/app/layout-composition/NavBar/NavItems.module.css";
import styles from "@/app/layout-composition/NavBar/MobileNavBar.module.css";
import chromeStyles from "@/components/layout/PageChrome/PageChrome.module.css";

const externalLinks = [
	{ href: "https://massartsim.org/", label: "Website" },
	{ href: "https://massartsim.org/courses/", label: "Courses" },
];

interface MobileNavBarProps {
	isAdmin: boolean;
	user: Session["user"];
}

export default function MobileNavBar({ isAdmin, user }: MobileNavBarProps) {
	const [isOpen, setIsOpen] = useState(false);
	const isMobile = useIsMobile();
	const pathname = usePathname();
	const { collapseProgress, isCollapsed } = usePageChrome();
	const expandedActionsRef = useRef<HTMLDivElement>(null);
	const [expandedActionsHeight, setExpandedActionsHeight] = useState(90);
	const rowProgress = Math.min(1, collapseProgress / COLLAPSED_THRESHOLD);
	const pageChromeStyle = {
		"--mobile-chrome-collapse": rowProgress,
		"--mobile-chrome-expanded-height": `${expandedActionsHeight}px`,
	} as CSSProperties;

	useLayoutEffect(() => {
		const expandedActions = expandedActionsRef.current;
		if (!expandedActions || isCollapsed) return;
		const measure = () => setExpandedActionsHeight(expandedActions.getBoundingClientRect().height);
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(expandedActions);
		return () => observer.disconnect();
	}, [isCollapsed]);

	useEffect(() => {
		setIsOpen(false);
	}, [pathname]);

	return (
		<>
			<div
				className={styles.topBar}
				style={pageChromeStyle}
				data-mobile-chrome-collapsed={isCollapsed || undefined}
			>
				<div className={styles.menuLogoFilter}>
					<div className={styles.menuLogoFilterRow}>
					<button
						className={styles.menuButton}
						onClick={() => setIsOpen(true)}
						aria-label="Open navigation menu"
						aria-expanded={isOpen}
					>
						<span className={styles.menuIconAsset} aria-hidden="true" />
					</button>
					<span className={`${styles.brand} brand-text`}>SIM</span>
					{/* PageChrome portals mobile page identity/scope into these slots. */}
					<PageChromeSlot id="mobile-page-top-title-slot" className={styles.topTitleSlot} />
					<div className={styles.collapsedIdentity}>
						<div className={styles.pageIdentity}>
							<PageChromeSlot id="mobile-page-collapsed-title-slot" className={styles.pageTitleSlot} />
							<PageChromeSlot id="mobile-page-collapsed-status-slot" className={styles.pageStatusSlot} />
						</div>
					</div>
					<div className={styles.menuControls}>
						<PageChromeSlot id="mobile-page-filter-slot" className={styles.pageFilterSlot} />
						<PageChromeSlot id="mobile-page-search-slot" className={styles.searchSlot} />
					</div>
					</div>
				</div>
				<div className={styles.menuActions}>
					<div ref={expandedActionsRef} className={styles.expandedActions} inert={isCollapsed || undefined}>
					<div className={styles.pageIdentity}>
						<PageChromeSlot id="mobile-page-title-slot" className={styles.pageTitleSlot} />
						<PageChromeSlot id="mobile-page-status-slot" className={styles.pageStatusSlot} />
					</div>
					<PageChromeSlot id="mobile-page-actions-slot" className={clsx(styles.pageActionsSlot, chromeStyles.compactActions)} data-button-compact />
					</div>
					{isMobile && (
						<>
							<PageChromeSlot id="mobile-page-bar-tools" className={styles.compactTools} />
							<PageChromeSlot id="mobile-page-bar-actions" className={clsx(styles.compactPageActions, chromeStyles.compactActions)} data-button-compact />
						</>
					)}
				</div>
			</div>

			{isOpen && (
				<div
					className={styles.backdrop}
					onClick={() => setIsOpen(false)}
					aria-hidden="true"
				/>
			)}

			<div
				className={clsx(styles.panel, isOpen && styles.panelOpen, "ui-sidebar")}
				aria-label="Navigation menu"
				inert={!isOpen || undefined}
			>
				<div className={styles.panelInner}>
					<div className={styles.panelHeader}>
						<span className={`${styles.panelBrand} brand-text`}>SIM</span>
						<button
							className={styles.closeButton}
							onClick={() => setIsOpen(false)}
							aria-label="Close navigation menu"
						>
							<span className={styles.closeIconAsset} aria-hidden="true" />
						</button>
					</div>

					<MobileOnly>
						<div className={styles.primaryNavigation}>
							<div className={navStyles.navButtonList}>
								<NavButtonLink href="/users" label="People" iconClassName={navStyles.peopleIcon} />
								{isAdmin && (
									<NavButtonLink href="/individual" label="Progress" iconClassName={navStyles.individualIcon} />
								)}
								<NavButtonLink href="/thursdays" label="Thursdays" iconClassName={navStyles.thursdayIcon} />
								{isAdmin && (
									<NavButtonLink href="/semester" label="Semesters" iconClassName={navStyles.semestersIcon} />
								)}
							</div>
						</div>

						<div className={clsx(styles.relatedLinks, "flex w-full min-w-0 flex-col gap-2 pt-4")}>
							<div className={navStyles.externalMarker}>
								<span className={`${navStyles.externalMarkerButton} rounded-md bg-transparent text-[var(--app-icon)]`}>
									<span className={`${navStyles.navLabel} ui-label`}>Related</span>
								</span>
							</div>
							<div className={navStyles.externalLinkList}>
								<div className={`${navStyles.navItemContent} ${navStyles.externalGroupLabel}`}>
									<span className={`${navStyles.navLabel} ui-label`}>SIM links</span>
								</div>
								{externalLinks.map((link) => (
									<Button
										key={link.label}
										href={link.href}
										target="_blank"
										rel="noreferrer"
										variant="nav"
									>
										<span className={`${navStyles.navItemContent} ${navStyles.simLinkContent}`}>
											<span className={navStyles.navLabel}>
												{link.label}
												<MaskIcon icon="arrow_outward/arrow_outward.svg" className={navStyles.outwardIcon} />
											</span>
										</span>
									</Button>
								))}
								<SimHistoryLink />
								<div className={`${navStyles.navItemContent} ${navStyles.externalGroupLabel}`}>
									<span className={`${navStyles.navLabel} ui-label`}>Social</span>
								</div>
								<Button href="https://massartsim.slack.com" target="_blank" rel="noreferrer" variant="nav">
									<span className={`${navStyles.navItemContent} ${navStyles.simLinkContent}`}>
										<span className={navStyles.navLabel}>
										Slack
										<MaskIcon icon="arrow_outward/arrow_outward.svg" className={navStyles.outwardIcon} />
										</span>
									</span>
								</Button>
							</div>
						</div>

						<div className={clsx(styles.panelFooter, "mt-auto flex w-full min-w-0 flex-col")}>
							<div className="flex w-full min-w-0 items-center gap-2">
								<div className={clsx(styles.themeNav, "min-w-0 flex-1")}>
									<ThemeSwitch />
								</div>
								<div className={styles.colorThemeNav}>
									<ColorThemePopover />
								</div>
							</div>
							<div className={clsx(styles.accountNav, "pt-4")}>
								<UserAccountLink user={user} />
							</div>
						</div>
					</MobileOnly>
				</div>
			</div>
		</>
	);
}

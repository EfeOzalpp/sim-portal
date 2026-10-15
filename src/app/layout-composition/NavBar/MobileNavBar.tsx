"use client";

import { useState, useEffect, type CSSProperties } from "react";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import type { Session } from "next-auth";
import { Button } from "@/components/button";
import { MaskIcon } from "@/theme/MaskIcon";
import { usePageChrome } from "@/components/layout/PageChrome";
import { MobileOnly } from "@/components/layout/breakpoints";
import NavButtonLink from "@/app/layout-composition/NavBar/links/NavButtonLink";
import UserAccountLink from "@/app/layout-composition/NavBar/links/UserAccountLink";
import ThemeSwitch from "@/app/layout-composition/NavBar/theme/ThemeSwitch";
import ColorThemePopover from "@/app/layout-composition/NavBar/theme/ColorThemePopover";
import SimHistoryLink from "@/app/layout-composition/NavBar/links/SimHistoryLink";
import navStyles from "@/app/layout-composition/NavBar/NavItems.module.css";
import styles from "@/app/layout-composition/NavBar/MobileNavBar.module.css";

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
	const pathname = usePathname();
	const { collapseProgress, isCollapsed } = usePageChrome();
	const pageChromeStyle = {
		"--mobile-chrome-collapse": collapseProgress,
		"--mobile-chrome-title-height": `${(1 - collapseProgress) * 3.75}rem`,
		"--mobile-chrome-title-opacity": 1 - collapseProgress,
	} as CSSProperties;

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
					<button
						className={styles.menuButton}
						onClick={() => setIsOpen(true)}
						aria-label="Open navigation menu"
						aria-expanded={isOpen}
					>
						<span className={styles.menuIconAsset} aria-hidden="true" />
					</button>
					<span className={styles.brand}>SIM</span>
					{/* PageChrome portals mobile page identity/scope into these slots. */}
					<div id="mobile-page-collapsed-title-slot" className={styles.collapsedTitleSlot} />
					<div id="mobile-page-filter-slot" className={styles.pageFilterSlot} />
				</div>
				<div id="mobile-page-title-slot" className={styles.menuTitle} />
			</div>

			{isOpen && (
				<div
					className={styles.backdrop}
					onClick={() => setIsOpen(false)}
					aria-hidden="true"
				/>
			)}

			<div
				className={`${styles.panel} ${isOpen ? styles.panelOpen : ""}`}
				aria-label="Navigation menu"
				inert={!isOpen || undefined}
			>
				<div className={styles.panelInner}>
					<div className={styles.panelHeader}>
						<span className={styles.panelBrand}>SIM</span>
						<button
							className={styles.closeButton}
							onClick={() => setIsOpen(false)}
							aria-label="Close navigation menu"
						>
							<span className={styles.closeIconAsset} aria-hidden="true" />
						</button>
					</div>

					<MobileOnly>
						<div className="w-full min-w-0">
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

						<div className="flex w-full min-w-0 flex-col gap-2 pt-4">
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

						<div className="mt-auto flex w-full min-w-0 flex-col">
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

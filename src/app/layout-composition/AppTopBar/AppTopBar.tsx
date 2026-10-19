"use client";

import { useEffect, useState } from "react";
import type { Session } from "next-auth";
import Button from "@/components/button";
import { DesktopOnly } from "@/components/layout/breakpoints";
import { PageChromeSlot } from "@/components/layout/PageChrome/slots";
import ThemeSwitch from "@/app/layout-composition/NavBar/theme/ThemeSwitch";
import ColorThemePopover from "@/app/layout-composition/NavBar/theme/ColorThemePopover";
import UserAccountLink from "@/app/layout-composition/NavBar/links/UserAccountLink";
import styles from "@/app/layout-composition/AppTopBar/AppTopBar.module.css";

const DESKTOP_NAV_STORAGE_KEY = "sim-desktop-nav";

interface AppTopBarProps {
	user: Session["user"];
}

export default function AppTopBar({ user }: AppTopBarProps) {
	const [isNavExpanded, setIsNavExpanded] = useState(false);

	useEffect(() => {
		const storedValue = window.localStorage.getItem(DESKTOP_NAV_STORAGE_KEY);
		const shouldExpand = storedValue === "expanded";
		setIsNavExpanded(shouldExpand);
		document.documentElement.dataset.desktopNav = shouldExpand ? "expanded" : "collapsed";
	}, []);

	const toggleDesktopNav = () => {
		setIsNavExpanded((currentValue) => {
			const nextValue = !currentValue;
			document.documentElement.dataset.desktopNav = nextValue ? "expanded" : "collapsed";
			window.localStorage.setItem(DESKTOP_NAV_STORAGE_KEY, nextValue ? "expanded" : "collapsed");
			return nextValue;
		});
	};

	return (
		<header className={styles.root} aria-label="Page header">
			<div className={styles.leadGroup}>
				<div className={styles.leading}>
					<div className={styles.menuCell}>
						<Button
							surface="page"
							variant="icon"
							aria-label={isNavExpanded ? "Collapse navigation menu" : "Expand navigation menu"}
							aria-pressed={isNavExpanded}
							className="aria-pressed:bg-transparent! aria-pressed:hover:bg-[var(--button-bg-hover)]!"
							onClick={toggleDesktopNav}
							icon="menu/menu.svg"
						/>
					</div>
					<div className={`${styles.brand} brand-text`}>SIM</div>
				</div>
				<PageChromeSlot id="page-chrome-title-slot" className={`${styles.titleSlot} brand-text`} />
			</div>
			<PageChromeSlot id="page-chrome-scope-slot" className={styles.scopeSlot} />
			<PageChromeSlot id="page-chrome-controls-slot" className={styles.controlsSlot} />
			<div className={styles.tools}>
				<DesktopOnly>
					<ThemeSwitch iconOnly />
					<ColorThemePopover side="bottom" align="end" />
					<UserAccountLink user={user} iconOnly />
				</DesktopOnly>
			</div>
		</header>
	);
}

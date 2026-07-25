"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import type { Session } from "next-auth";
import { Button } from "@/components/primitives/AntD";
import NavButtonLink from "@/components/layout/NavBar/NavButtonLink";
import UserAccountLink from "@/components/layout/NavBar/UserAccountLink";
import ThemeSwitch from "@/components/layout/NavBar/ThemeSwitch";
import navStyles from "@/components/layout/NavBar/NavBar.module.css";
import styles from "@/components/layout/NavBar/MobileNavBar.module.css";

const externalLinks = [
	{ href: "https://massartsim.org/", label: "SIM Website" },
	{ href: "https://massartsim.org/courses/", label: "SIM Courses" },
];

interface MobileNavBarProps {
	isAdmin: boolean;
	user: Session["user"];
}

export default function MobileNavBar({ isAdmin, user }: MobileNavBarProps) {
	const [isOpen, setIsOpen] = useState(false);
	const pathname = usePathname();

	useEffect(() => {
		setIsOpen(false);
	}, [pathname]);

	return (
		<>
			<div className={styles.topBar}>
				<button
					className={styles.menuButton}
					onClick={() => setIsOpen(true)}
					aria-label="Open navigation menu"
					aria-expanded={isOpen}
				>
					<span className={styles.menuIconAsset} aria-hidden="true" />
				</button>
				<span className={styles.brandText}>SIM</span>
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

					<div className={navStyles.navItemsDivider}>
						<div className={navStyles.navButtonList}>
							<NavButtonLink href="/users" label="People" iconClassName={navStyles.peopleIcon} />
							{isAdmin && (
								<NavButtonLink href="/individual" label="Individual" iconClassName={navStyles.individualIcon} />
							)}
						</div>
						<div className={`${navStyles.navButtonList} ${navStyles.navButtonGroup}`}>
							<NavButtonLink href="/thursdays" label="Thursdays" iconClassName={navStyles.thursdayIcon} />
							{isAdmin && (
								<NavButtonLink href="/semester" label="Semesters" iconClassName={navStyles.listIcon} />
							)}
						</div>
					</div>

					<div className={navStyles.externalNav}>
						<div className={navStyles.externalLinkList}>
							{externalLinks.map((link) => (
								<Button
									key={link.label}
									href={link.href}
									target="_blank"
									rel="noreferrer"
									className="nav-button"
								>
									<span className={navStyles.navItemContent}>
										<span className={`${navStyles.navIcon} ${navStyles.assetIcon} ${navStyles.linkIcon}`} aria-hidden="true" />
										<span className={navStyles.navLabel}>{link.label}</span>
									</span>
								</Button>
							))}
						</div>
					</div>

					<div className={navStyles.footerNav}>
						<div className={navStyles.themeNav}>
							<ThemeSwitch />
						</div>
						<div className={navStyles.accountNav}>
							<UserAccountLink user={user} />
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

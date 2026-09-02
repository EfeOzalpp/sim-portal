import React from "react";
import styles from "@/components/layout/NavBar/NavBar.module.css";
import Button from "@/components/button/button-component";
import NavButtonLink from "@/components/layout/NavBar/NavButtonLink";
import { auth } from "@/authentication";
import { Session } from "next-auth";
import AdminOnly from "@/components/layout/AdminOnly";
import UserAccountLink from "@/components/layout/NavBar/UserAccountLink";
import ThemeSwitch from "@/components/layout/NavBar/ThemeSwitch";
import MobileNavBar from "@/components/layout/NavBar/MobileNavBar";

interface NavBarProps {
	session?: Session | null;
}

const externalLinks = [
	{ href: "https://massartsim.org/", label: "SIM Website" },
	{ href: "https://massartsim.org/courses/", label: "SIM Courses" },
];

export default async function NavBar({ session: initialSession }: NavBarProps) {
	const session = initialSession === undefined ? await auth() : initialSession;
	if (!session) {
		return null;
	}

	const isAdmin = session.user?.role === "ADMIN";

	return (
		<>
			{/* Desktop nav: collapsible rail, hidden on mobile */}
			<nav className={styles.root} aria-label="Primary navigation" data-collapsible-nav>
				<div className={styles.brand}>SIM</div>
				<div className={styles.navItemsDivider}>
					<div className={styles.navButtonList}>
						<NavButtonLink href="/users" label="People" iconClassName={styles.peopleIcon} />
						<AdminOnly>
							<NavButtonLink href="/individual" label="Individual" iconClassName={styles.individualIcon} />
						</AdminOnly>
					</div>
					<div className={`${styles.navButtonList} ${styles.navButtonGroup}`}>
						<NavButtonLink href="/thursdays" label="Thursdays" iconClassName={styles.thursdayIcon} />
						<AdminOnly>
							<NavButtonLink href="/semester" label="Semesters" iconClassName={styles.listIcon} />
						</AdminOnly>
					</div>
				</div>
				<div className={styles.externalNav}>
					<div className={styles.externalMarker} aria-label="External links">
						<span className={`${styles.externalMarkerButton} nav-button-visual`} aria-hidden="true">
							<span className={`${styles.navIcon} ${styles.assetIcon} ${styles.linkIcon}`} />
						</span>
						<span className={`${styles.navIcon} ${styles.assetIcon} ${styles.moreVerticalIcon} ${styles.externalMoreIcon}`} aria-hidden="true" />
					</div>
					<div className={styles.externalLinkList}>
						{externalLinks.map((link) => (
							<Button
								key={link.label}
								href={link.href}
								target="_blank"
								rel="noreferrer"
								variant="nav"
							>
								<span className={styles.navItemContent}>
									<span className={`${styles.navIcon} ${styles.assetIcon} ${styles.linkIcon}`} aria-hidden="true" />
									<span className={styles.navLabel}>{link.label}</span>
								</span>
							</Button>
						))}
					</div>
				</div>
				<div className={styles.footerNav}>
					<div className={styles.themeNav}>
						<ThemeSwitch />
					</div>
					<div className={styles.accountNav}>
						<UserAccountLink user={session.user} />
					</div>
				</div>
			</nav>

			{/* Mobile nav: hamburger top bar + slide-in panel, hidden on desktop */}
			<MobileNavBar isAdmin={isAdmin} user={session.user} />
		</>
	);
}

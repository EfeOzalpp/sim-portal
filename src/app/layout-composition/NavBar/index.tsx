import clsx from "clsx";
import styles from "@/app/layout-composition/NavBar/NavBar.module.css";

import { auth } from "@/authentication";
import { Session } from "next-auth";

// primitive
import Button from "@/components/button";

// layout specific 
import AdminOnly from "@/app/layout-composition/NavBar/AdminOnly";
import NavButtonLink from "@/app/layout-composition/NavBar/NavButtonLink";
import UserAccountLink from "@/app/layout-composition/NavBar/UserAccountLink";
import ThemeSwitch from "@/app/layout-composition/NavBar/ThemeSwitch";
import MobileNavBar from "@/app/layout-composition/NavBar/MobileNavBar";

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
				<div className="m-0 flex min-h-5 items-center justify-center overflow-hidden font-heading text-2xl font-bold whitespace-nowrap leading-tight text-[var(--brand-color)]">SIM</div>
				<div className="w-full min-w-0">
					<div className={styles.navButtonList}>
						<NavButtonLink href="/users" label="People" iconClassName={styles.peopleIcon} />
						<AdminOnly>
							<NavButtonLink href="/individual" label="Individual" iconClassName={styles.individualIcon} />
						</AdminOnly>
					</div>
					<div className={clsx(styles.navButtonList, "mt-4 border-t border-t-[var(--app-border)] pt-4")}>
						<NavButtonLink href="/thursdays" label="Thursdays" iconClassName={styles.thursdayIcon} />
						<AdminOnly>
							<NavButtonLink href="/semester" label="Semesters" iconClassName={styles.listIcon} />
						</AdminOnly>
					</div>
				</div>
				<div className="flex w-full min-w-0 flex-col gap-2 border-t border-t-[var(--app-border)] pt-4">
					<div className={styles.externalMarker} aria-label="External links">
						<span className={`${styles.externalMarkerButton} rounded-md bg-transparent text-[var(--app-icon)]`} aria-hidden="true">
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
				<div className="mt-auto flex w-full min-w-0 flex-col">
					<div className={styles.themeNav}>
						<ThemeSwitch />
					</div>
					<div className={clsx(styles.accountNav, "pt-4")}>
						<UserAccountLink user={session.user} />
					</div>
				</div>
			</nav>

			{/* Mobile nav: hamburger top bar + slide-in panel, hidden on desktop */}
			<MobileNavBar isAdmin={isAdmin} user={session.user} />
		</>
	);
}

import clsx from "clsx";
import styles from "@/app/layout-composition/NavBar/NavBar.module.css";

import { auth } from "@/authentication";
import { Session } from "next-auth";
import { isAdminRole } from "@/constants/roles";

// primitive
import Button from "@/components/button";

// layout specific 
import AdminOnly from "@/app/layout-composition/NavBar/AdminOnly";
import NavButtonLink from "@/app/layout-composition/NavBar/NavButtonLink";
import NavScrollArea from "@/app/layout-composition/NavBar/NavScrollArea";
import UserAccountLink from "@/app/layout-composition/NavBar/UserAccountLink";
import ThemeSwitch from "@/app/layout-composition/NavBar/ThemeSwitch";
import ColorThemePopover from "@/app/layout-composition/NavBar/ColorThemePopover";
import MobileNavBar from "@/app/layout-composition/NavBar/MobileNavBar";
import SimHistoryLink from "@/app/layout-composition/NavBar/SimHistoryLink";

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

	const isAdmin = isAdminRole(session.user?.role);

	return (
		<>
			{/* Desktop nav: collapsible rail, hidden on mobile */}
			<nav className={styles.root} aria-label="Primary navigation" data-collapsible-nav>
				{/* Just a small mt-[0.8rem] nudge - matching PageTitle's height overlapped once the rail expands on hover. Desktop-only already, since .root is display: none below 769px. */}
				<div className="m-0 mt-[0.8rem] flex min-h-5 shrink-0 items-center justify-center overflow-hidden font-heading text-2xl font-bold whitespace-nowrap leading-tight text-[var(--brand-color)]">SIM</div>
				<div className="w-full min-w-0 shrink-0">
					<div className={styles.navButtonList}>
						<NavButtonLink href="/users" label="People" iconClassName={styles.peopleIcon} />
						<AdminOnly>
							<NavButtonLink href="/individual" label="Progress" iconClassName={styles.individualIcon} />
						</AdminOnly>
						<NavButtonLink href="/thursdays" label="Thursdays" iconClassName={styles.thursdayIcon} />
						<AdminOnly>
							<NavButtonLink href="/semester" label="Semesters" iconClassName={styles.listIcon} />
						</AdminOnly>
					</div>
				</div>
				<div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-2  pt-4">
					<div className={styles.externalMarker} aria-label="More links">
						<span className={`${styles.externalMarkerButton} rounded-md bg-transparent text-[var(--app-icon)]`} aria-hidden="true">
							<span className={`${styles.navIcon} ${styles.assetIcon} ${styles.linkIcon}`} />
						</span>
						<span className={`${styles.navIcon} ${styles.assetIcon} ${styles.moreVerticalIcon} ${styles.externalMoreIcon}`} aria-hidden="true" />
					</div>
					{/* This list (not navButtonList) grows over time - fills the room left between navButtonList and the footer, scrolls once it exceeds that. */}
					<NavScrollArea>
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
							<SimHistoryLink />
							<Button href="https://massartsim.slack.com" target="_blank" rel="noreferrer" variant="nav">
								<span className={styles.navItemContent}>
									<span className={`${styles.navIcon} ${styles.assetIcon} ${styles.linkIcon}`} aria-hidden="true" />
									<span className={styles.navLabel}>Slack</span>
								</span>
							</Button>
						</div>
					</NavScrollArea>
				</div>
				{/* No mt-auto needed - the flex-1 section above already consumes remaining space, leaving this at the bottom. */}
				<div className="flex w-full min-w-0 flex-none flex-col">
					<div className="flex w-full min-w-0 items-center gap-2">
						<div className={clsx(styles.themeNav, "min-w-0 flex-1")}>
							<ThemeSwitch />
						</div>
						<div className={styles.colorThemeNav}>
							<ColorThemePopover />
						</div>
					</div>
					<div className={clsx(styles.accountNav, "pt-2")}>
						<UserAccountLink user={session.user} />
					</div>
				</div>
			</nav>

			{/* Mobile nav: hamburger top bar + slide-in panel, hidden on desktop */}
			<MobileNavBar isAdmin={isAdmin} user={session.user} />
		</>
	);
}

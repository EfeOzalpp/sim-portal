import styles from "@/app/layout-composition/NavBar/NavBar.module.css";
import itemStyles from "@/app/layout-composition/NavBar/NavItems.module.css";

import { auth } from "@/authentication";
import { Session } from "next-auth";

// primitive
import Button from "@/components/button";
import { MaskIcon } from "@/theme/MaskIcon";

// layout specific 
import AdminOnly from "@/app/layout-composition/NavBar/AdminOnly";
import NavButtonLink from "@/app/layout-composition/NavBar/links/NavButtonLink";
import NavScrollArea from "@/app/layout-composition/NavBar/NavScrollArea";
import SimHistoryLink from "@/app/layout-composition/NavBar/links/SimHistoryLink";

interface NavBarProps {
	session?: Session | null;
}

const externalLinks = [
	{ href: "https://massartsim.org/", label: "Website" },
	{ href: "https://massartsim.org/courses/", label: "Courses" },
];

export default async function NavBar({ session: initialSession }: NavBarProps) {
	const session = initialSession === undefined ? await auth() : initialSession;
	if (!session) {
		return null;
	}

	return (
		<>
			{/* Desktop global navigation rail.
			   Owns app-level route navigation; theme controls and account entry live in AppTopBar on desktop.
			   It should stay independent from the upcoming page command header,
			   except for shared shell tokens such as --nav-rail-collapsed-width. */}
			<nav className={styles.root} aria-label="Primary navigation">
				<div className="w-full min-w-0 shrink-0">
					<div className={itemStyles.navButtonList}>
						<NavButtonLink href="/users" label="People" iconClassName={itemStyles.peopleIcon} />
						<AdminOnly>
							<NavButtonLink href="/individual" label="Progress" iconClassName={itemStyles.individualIcon} />
						</AdminOnly>
						<NavButtonLink href="/thursdays" label="Thursdays" iconClassName={itemStyles.thursdayIcon} />
						<AdminOnly>
							<NavButtonLink href="/semester" label="Semesters" iconClassName={itemStyles.semestersIcon} />
						</AdminOnly>
					</div>
				</div>
				<div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-2  pt-4">
					<div className={`${itemStyles.externalMarker} ${styles.inset}`}>
						<span className={`${itemStyles.externalMarkerButton} rounded-md bg-transparent text-[var(--app-icon)]`}>
							<span className={`${itemStyles.navIcon} ${itemStyles.assetIcon} ${itemStyles.linkIcon} ${styles.collapsedRelatedIcon}`} aria-hidden="true" />
							<span className={`${itemStyles.navLabel} ui-label`}>Related</span>
						</span>
					</div>
					{/* This list (not navButtonList) grows over time - fills the room left between navButtonList and the footer, scrolls once it exceeds that. */}
					<NavScrollArea>
						<div className={`${itemStyles.externalLinkList} ${styles.externalLinks}`}>
							<div className={`${itemStyles.navItemContent} ${itemStyles.externalGroupLabel}`}>
								<span className={`${itemStyles.navLabel} ui-label`}>SIM links</span>
							</div>
							{externalLinks.map((link) => (
								<Button
									key={link.label}
									href={link.href}
									target="_blank"
									rel="noreferrer"
									variant="nav"
								>
									<span className={`${itemStyles.navItemContent} ${itemStyles.simLinkContent}`}>
										<span className={itemStyles.navLabel}>
											{link.label}
											<MaskIcon icon="arrow_outward/arrow_outward.svg" className={itemStyles.outwardIcon} />
										</span>
									</span>
								</Button>
							))}
							<SimHistoryLink />
							<div className={`${itemStyles.navItemContent} ${itemStyles.externalGroupLabel}`}>
								<span className={`${itemStyles.navLabel} ui-label`}>Social</span>
							</div>
							<Button href="https://massartsim.slack.com" target="_blank" rel="noreferrer" variant="nav">
								<span className={`${itemStyles.navItemContent} ${itemStyles.simLinkContent}`}>
									<span className={itemStyles.navLabel}>
										Slack
										<MaskIcon icon="arrow_outward/arrow_outward.svg" className={itemStyles.outwardIcon} />
									</span>
								</span>
							</Button>
						</div>
					</NavScrollArea>
				</div>
			</nav>
		</>
	);
}

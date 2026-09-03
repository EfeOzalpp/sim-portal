"use client";

import { useState, useEffect } from "react";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import type { Session } from "next-auth";
import { Button } from "@/components/button";
import NavButtonLink from "@/app/layout-composition/NavBar/NavButtonLink";
import UserAccountLink from "@/app/layout-composition/NavBar/UserAccountLink";
import ThemeSwitch from "@/app/layout-composition/NavBar/ThemeSwitch";
import navStyles from "@/app/layout-composition/NavBar/NavBar.module.css";
import styles from "@/app/layout-composition/NavBar/MobileNavBar.module.css";

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
				<span className="text-2xl leading-tight font-bold font-heading text-[var(--brand-color)]">SIM</span>
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
						<span className="col-start-2 text-center text-2xl leading-tight font-bold font-heading text-[var(--brand-color)]">SIM</span>
						<button
							className={styles.closeButton}
							onClick={() => setIsOpen(false)}
							aria-label="Close navigation menu"
						>
							<span className={styles.closeIconAsset} aria-hidden="true" />
						</button>
					</div>

					<div className="w-full min-w-0">
						<div className={navStyles.navButtonList}>
							<NavButtonLink href="/users" label="People" iconClassName={navStyles.peopleIcon} />
							{isAdmin && (
								<NavButtonLink href="/individual" label="Individual" iconClassName={navStyles.individualIcon} />
							)}
						</div>
						<div className={clsx(navStyles.navButtonList, "mt-4 border-t border-t-[var(--app-border)] pt-4")}>
							<NavButtonLink href="/thursdays" label="Thursdays" iconClassName={navStyles.thursdayIcon} />
							{isAdmin && (
								<NavButtonLink href="/semester" label="Semesters" iconClassName={navStyles.listIcon} />
							)}
						</div>
					</div>

					<div className="flex w-full min-w-0 flex-col gap-2 border-t border-t-[var(--app-border)] pt-4">
						<div className={navStyles.externalLinkList}>
							{externalLinks.map((link) => (
								<Button
									key={link.label}
									href={link.href}
									target="_blank"
									rel="noreferrer"
									variant="nav"
								>
									<span className={navStyles.navItemContent}>
										<span className={`${navStyles.navIcon} ${navStyles.assetIcon} ${navStyles.linkIcon}`} aria-hidden="true" />
										<span className={navStyles.navLabel}>{link.label}</span>
									</span>
								</Button>
							))}
						</div>
					</div>

					<div className="mt-auto flex w-full min-w-0 flex-col">
						<div className={navStyles.themeNav}>
							<ThemeSwitch />
						</div>
						<div className={clsx(navStyles.accountNav, "pt-4")}>
							<UserAccountLink user={user} />
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/primitives/AntD";
import styles from "@/components/layout/NavBar/NavBar.module.css";
import {
	LEGACY_SEMESTER_FILTER_KEY,
	SEMESTER_FILTER_KEY,
} from "@/components/domain/semesters/semester-filter";

interface NavButtonLinkProps {
	href: string;
	label: string;
	iconClassName: string;
}

function isActivePath(pathname: string, href: string) {
	return pathname === href || pathname.startsWith(`${href}/`);
}

export default function NavButtonLink({ href, label, iconClassName }: NavButtonLinkProps) {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const isActive = isActivePath(pathname, href);
	const semesterId = searchParams.get(SEMESTER_FILTER_KEY) || searchParams.get(LEGACY_SEMESTER_FILTER_KEY);
	const hrefWithSemester = semesterId
		? `${href}?${SEMESTER_FILTER_KEY}=${encodeURIComponent(semesterId)}`
		: href;

	return (
		<Button
			href={hrefWithSemester}
			className="nav-button"
			aria-current={isActive ? "page" : undefined}
		>
			<span className={styles.navItemContent}>
				<span className={`${styles.navIcon} ${styles.assetIcon} ${iconClassName}`} aria-hidden="true" />
				<span className={styles.navLabel}>{label}</span>
			</span>
		</Button>
	);
}

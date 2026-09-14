"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/button";
import styles from "@/app/layout-composition/NavBar/NavBar.module.css";
import { SIM_HISTORY_MODAL_PARAM } from "@/constants/modal-params";

// Opens the SIM History modal (rendered from the root layout) instead of navigating - see NavBar/index.tsx and MobileNavBar.tsx.
export default function SimHistoryLink() {
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const params = new URLSearchParams(searchParams.toString());
	params.set(SIM_HISTORY_MODAL_PARAM, "1");
	const href = `${pathname}?${params.toString()}`;

	return (
		<Button href={href} variant="nav">
			<span className={styles.navItemContent}>
				<span className={`${styles.navIcon} ${styles.assetIcon} ${styles.linkIcon}`} aria-hidden="true" />
				<span className={styles.navLabel}>SIM History</span>
			</span>
		</Button>
	);
}

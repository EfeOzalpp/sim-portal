"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/button";
import { MaskIcon } from "@/theme/MaskIcon";
import styles from "@/app/layout-composition/NavBar/NavItems.module.css";
import { SIM_HISTORY_MODAL_PARAM } from "@/constants/modal-params";

// Opens the SIM History modal (rendered from the root layout) instead of navigating - see NavBar.tsx and MobileNavBar.tsx.
export default function SimHistoryLink() {
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const params = new URLSearchParams(searchParams.toString());
	params.set(SIM_HISTORY_MODAL_PARAM, "1");
	const href = `${pathname}?${params.toString()}`;

	return (
		<Button href={href} variant="nav">
			<span className={`${styles.navItemContent} ${styles.simLinkContent}`}>
				<span className={styles.navLabel}>
					History
					<MaskIcon icon="text/text.svg" className={styles.outwardIcon} />
				</span>
			</span>
		</Button>
	);
}

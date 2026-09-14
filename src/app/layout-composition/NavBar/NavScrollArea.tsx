import type { ReactNode } from "react";
import styles from "@/app/layout-composition/NavBar/NavBar.module.css";

interface NavScrollAreaProps {
	children: ReactNode;
}

// Fills whatever vertical room is left in the rail (see .navScrollArea /
// .navScrollAreaInner in NavBar.module.css for the actual flex/scroll
// mechanics) and scrolls internally once its content exceeds that - no
// fade indicator, just a plain scrollable region.
export default function NavScrollArea({ children }: NavScrollAreaProps) {
	return (
		<div className={styles.navScrollArea}>
			<div className={styles.navScrollAreaInner}>
				{children}
			</div>
		</div>
	);
}

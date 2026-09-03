"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/button";
import styles from "@/app/layout-composition/NavBar/NavBar.module.css";

type Theme = "light" | "dark";

function readTheme(): Theme {
	return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export default function ThemeSwitch() {
	const [theme, setTheme] = useState<Theme>("light");
	const nextTheme: Theme = theme === "dark" ? "light" : "dark";

	useEffect(() => {
		const root = document.documentElement;

		setTheme(readTheme());

		const observer = new MutationObserver(() => {
			setTheme(readTheme());
		});

		observer.observe(root, {
			attributes: true,
			attributeFilter: ["data-theme"],
		});

		return () => observer.disconnect();
	}, []);

	function handleToggle() {
		document.documentElement.dataset.theme = nextTheme;
		setTheme(nextTheme);
	}

	return (
		<Button
			variant="nav"
			onClick={handleToggle}
			aria-label={`Switch to ${nextTheme} mode`}
			aria-pressed={theme === "dark"}
		>
			<span className={styles.navItemContent}>
				<span
					className={`${styles.navIcon} ${styles.themeIcon} ${theme === "dark" ? styles.lightModeIcon : styles.darkModeIcon}`}
					aria-hidden="true"
				/>
				<span className={styles.navLabel}>
					{nextTheme === "dark" ? "Dark theme" : "Light theme"}
				</span>
			</span>
		</Button>
	);
}

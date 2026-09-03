"use client";

import { useEffect } from "react";

const THEME_STORAGE_KEY = "sim-theme";

function isTheme(value: string | undefined | null): value is "light" | "dark" {
	return value === "light" || value === "dark";
}

export default function ThemeSessionSync() {
	useEffect(() => {
		const root = document.documentElement;

		function persistCurrentTheme() {
			const currentTheme = root.dataset.theme;

			if (isTheme(currentTheme)) {
				sessionStorage.setItem(THEME_STORAGE_KEY, currentTheme);
			}
		}

		try {
			const storedTheme = sessionStorage.getItem(THEME_STORAGE_KEY);

			if (isTheme(storedTheme)) {
				root.dataset.theme = storedTheme;
			} else if (!isTheme(root.dataset.theme)) {
				root.dataset.theme = "light";
			}

			persistCurrentTheme();
		} catch {
			return;
		}

		const observer = new MutationObserver(persistCurrentTheme);
		observer.observe(root, {
			attributes: true,
			attributeFilter: ["data-theme"],
		});

		return () => observer.disconnect();
	}, []);

	return null;
}

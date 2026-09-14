"use client";

import { useEffect } from "react";

const THEME_STORAGE_KEY = "sim-theme";
const COLOR_THEME_STORAGE_KEY = "sim-color-theme";

function isTheme(value: string | undefined | null): value is "light" | "dark" {
	return value === "light" || value === "dark";
}

function isColorTheme(value: string | undefined | null): value is "default" | "purple-green" {
	return value === "default" || value === "purple-green";
}

// Keeps both [data-theme] (light/dark) and the independent [data-color-theme]
// axis (mainframe-theme/*.css) synced to localStorage - not just for the two
// dedicated toggle buttons (ThemeSwitch/ColorThemePopover), but for anything
// else that ever sets these attributes directly, since both are observed here.
export default function ThemeStorageSync() {
	useEffect(() => {
		const root = document.documentElement;

		function persistCurrentTheme() {
			const currentTheme = root.dataset.theme;

			if (isTheme(currentTheme)) {
				localStorage.setItem(THEME_STORAGE_KEY, currentTheme);
			}
		}

		function persistCurrentColorTheme() {
			const currentColorTheme = root.dataset.colorTheme;

			if (isColorTheme(currentColorTheme)) {
				localStorage.setItem(COLOR_THEME_STORAGE_KEY, currentColorTheme);
			}
		}

		try {
			const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);

			if (isTheme(storedTheme)) {
				root.dataset.theme = storedTheme;
			} else if (!isTheme(root.dataset.theme)) {
				root.dataset.theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
			}

			persistCurrentTheme();

			const storedColorTheme = localStorage.getItem(COLOR_THEME_STORAGE_KEY);

			if (isColorTheme(storedColorTheme)) {
				root.dataset.colorTheme = storedColorTheme;
			} else if (!isColorTheme(root.dataset.colorTheme)) {
				root.dataset.colorTheme = "default";
			}

			persistCurrentColorTheme();
		} catch {
			return;
		}

		const observer = new MutationObserver((mutations) => {
			for (const mutation of mutations) {
				if (mutation.attributeName === "data-theme") {
					persistCurrentTheme();
				} else if (mutation.attributeName === "data-color-theme") {
					persistCurrentColorTheme();
				}
			}
		});

		observer.observe(root, {
			attributes: true,
			attributeFilter: ["data-theme", "data-color-theme"],
		});

		return () => observer.disconnect();
	}, []);

	return null;
}

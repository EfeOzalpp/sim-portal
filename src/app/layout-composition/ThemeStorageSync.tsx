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
		const colorProbe = document.createElement("span");
		colorProbe.hidden = true;
		document.body.append(colorProbe);

		function syncBrowserColor() {
			const modal = Array.from(document.querySelectorAll<HTMLElement>("[data-modal-popup] > [role=dialog]")).at(-1);
			// Resolve nested CSS variables to an actual color for browser metadata.
			colorProbe.style.background = "var(--app-bg)";
			let color = modal ? getComputedStyle(modal).backgroundColor : getComputedStyle(colorProbe).backgroundColor;
			// The alternate palette uses a gradient; browser chrome needs a solid color.
			if (color === "rgba(0, 0, 0, 0)") {
				colorProbe.style.background = "var(--app-theme)";
				color = getComputedStyle(colorProbe).backgroundColor;
			}
			if (modal) root.style.setProperty("--browser-chrome-bg", color);
			else root.style.removeProperty("--browser-chrome-bg");
			const meta = document.querySelector('meta[name="theme-color"]');
			if (meta?.getAttribute("content") !== color) meta?.setAttribute("content", color);
		}

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
			// Browser chrome still follows the theme when storage is unavailable.
		}
		syncBrowserColor();

		const observer = new MutationObserver((mutations) => {
			try {
				for (const mutation of mutations) {
					if (mutation.attributeName === "data-theme") {
						persistCurrentTheme();
					} else if (mutation.attributeName === "data-color-theme") {
						persistCurrentColorTheme();
					}
				}
			} catch {
				// Storage access is optional; visual theme changes must still work.
			} finally {
				syncBrowserColor();
			}
		});

		observer.observe(root, {
			attributes: true,
			attributeFilter: ["data-theme", "data-color-theme"],
		});

		const modalObserver = new MutationObserver((mutations) => {
			const modalChanged = mutations.some((mutation) =>
				[...mutation.addedNodes, ...mutation.removedNodes].some((node) =>
					node instanceof Element && (node.matches("[data-modal-popup]") || node.querySelector("[data-modal-popup]")),
				),
			);
			if (modalChanged) syncBrowserColor();
		});
		modalObserver.observe(document.body, { childList: true, subtree: true });

		// Route metadata can replace the theme-color tag after a modal closes.
		const metadataObserver = new MutationObserver((mutations) => {
			if (mutations.some((mutation) =>
				(mutation.target instanceof Element && mutation.target.matches('meta[name="theme-color"]')) ||
				[...mutation.addedNodes].some((node) => node instanceof Element &&
					(node.matches('meta[name="theme-color"]') || node.querySelector('meta[name="theme-color"]'))),
			)) syncBrowserColor();
		});
		metadataObserver.observe(document.head, { childList: true, subtree: true, attributes: true, attributeFilter: ["content"] });

		return () => {
			observer.disconnect();
			modalObserver.disconnect();
			metadataObserver.disconnect();
			root.style.removeProperty("--browser-chrome-bg");
			colorProbe.remove();
		};
	}, []);

	return null;
}

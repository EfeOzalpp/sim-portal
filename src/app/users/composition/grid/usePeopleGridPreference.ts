"use client";

import { useEffect, useState } from "react";
import { useIsMobile } from "@/components/layout/breakpoints";
import { PEOPLE_GRID_PREFERENCES, peopleGridColumns } from "@/constants/people-grid";

export function usePeopleGridPreference() {
	const isMobile = useIsMobile();
	const device = isMobile ? "mobile" : "desktop";
	const settings = PEOPLE_GRID_PREFERENCES[device];
	const [cardsPerRow, setCardsPerRow] = useState(settings.defaultValue);

	useEffect(() => {
		setCardsPerRow(peopleGridColumns(document.documentElement.style.getPropertyValue(settings.property), device));
		function syncStorage(event: StorageEvent) {
			for (const viewport of ["desktop", "mobile"] as const) {
				const preference = PEOPLE_GRID_PREFERENCES[viewport];
				if (event.key !== preference.key && event.key !== null) continue;
				const count = peopleGridColumns(event.newValue, viewport);
				document.documentElement.style.setProperty(preference.property, String(count));
				if (viewport === device) setCardsPerRow(count);
			}
		}
		window.addEventListener("storage", syncStorage);
		return () => window.removeEventListener("storage", syncStorage);
	}, [device, settings]);

	function setColumns(count: number) {
		const value = Math.min(Math.max(Math.round(count), settings.min), settings.max);
		document.documentElement.style.setProperty(settings.property, String(value));
		setCardsPerRow(value);
		try {
			window.localStorage.setItem(settings.key, String(value));
		} catch {
			// Keep the in-memory preference usable when storage is blocked.
		}
	}

	return { cardsPerRow, setColumns, minCardsPerRow: settings.min, maxCardsPerRow: settings.max };
}

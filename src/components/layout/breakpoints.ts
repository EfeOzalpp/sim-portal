"use client";

import { useEffect, useState, type ReactNode } from "react";

// Keep in sync with the @media (max-width: 768px) rules in the layout CSS modules.
export const MOBILE_MEDIA_QUERY = "(max-width: 768px)";

export function useIsMobile() {
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const query = window.matchMedia(MOBILE_MEDIA_QUERY);
		const update = () => setIsMobile(query.matches);
		update();
		query.addEventListener("change", update);
		return () => query.removeEventListener("change", update);
	}, []);

	return isMobile;
}

export function DesktopOnly({ children }: { children: ReactNode }) {
	return useIsMobile() ? null : children;
}

export function MobileOnly({ children }: { children: ReactNode }) {
	return useIsMobile() ? children : null;
}

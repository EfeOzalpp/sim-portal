"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ComponentPropsWithoutRef, type ReactNode } from "react";

export const pageChromeSlotIds = {
	desktopTitle: "page-chrome-title-slot",
	desktopScope: "page-chrome-scope-slot",
	desktopControls: "page-chrome-controls-slot",
	mobileTitle: "mobile-page-title-slot",
	mobileTopTitle: "mobile-page-top-title-slot",
	mobileCollapsedTitle: "mobile-page-collapsed-title-slot",
	mobileFilter: "mobile-page-filter-slot",
	mobileSearch: "mobile-page-search-slot",
	mobileStatus: "mobile-page-status-slot",
	mobileCollapsedStatus: "mobile-page-collapsed-status-slot",
	mobileActions: "mobile-page-actions-slot",
	mobileBarTools: "mobile-page-bar-tools",
	mobileBarActions: "mobile-page-bar-actions",
	barTools: "page-bar-tools",
	barStatus: "page-bar-status",
	barActions: "page-bar-actions",
	barTabs: "page-bar-tabs",
} as const;

export type PageChromeSlotId = (typeof pageChromeSlotIds)[keyof typeof pageChromeSlotIds];
type SlotTargets = Partial<Record<PageChromeSlotId, HTMLDivElement>>;

interface SlotRegistry {
	targets: SlotTargets;
	register: (id: PageChromeSlotId, node: HTMLDivElement) => () => void;
}

const SlotContext = createContext<SlotRegistry | null>(null);

function useSlotRegistry() {
	const registry = useContext(SlotContext);
	if (!registry) throw new Error("Page chrome slots must be inside PageChromeProvider.");
	return registry;
}

export function PageChromeSlotsProvider({ children }: { children: ReactNode }) {
	const [targets, setTargets] = useState<SlotTargets>({});
	const register = useCallback((id: PageChromeSlotId, node: HTMLDivElement) => {
		setTargets((current) => current[id] === node ? current : { ...current, [id]: node });
		return () => {
			setTargets((current) => {
				// A departing route must not unregister a newer host for the same slot.
				if (current[id] !== node) return current;
				const next = { ...current };
				delete next[id];
				return next;
			});
		};
	}, []);
	const value = useMemo(() => ({ targets, register }), [targets, register]);
	return <SlotContext.Provider value={value}>{children}</SlotContext.Provider>;
}

export function PageChromeSlot({ id, ...props }: Omit<ComponentPropsWithoutRef<"div">, "id" | "children"> & { id: PageChromeSlotId }) {
	const { register } = useSlotRegistry();
	const ref = useCallback((node: HTMLDivElement | null) => {
		if (node) return register(id, node);
	}, [id, register]);
	return <div {...props} id={id} ref={ref} />;
}

export function usePageChromeSlotTarget(id: PageChromeSlotId) {
	return useSlotRegistry().targets[id] ?? null;
}

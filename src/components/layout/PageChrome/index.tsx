"use client";

import {
	createContext,
	type ReactNode,
	type UIEventHandler,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";

const COLLAPSE_DISTANCE = 72;
const COLLAPSED_THRESHOLD = 0.92;

interface PageChromeReportOptions {
	preserveCollapsedUntilTop?: boolean;
	reopenDistance?: number;
}

interface PageChromeContextValue {
	collapseProgress: number;
	isCollapsed: boolean;
	hasScrolled: boolean;
	reportScrollTop: (scrollTop: number, options?: PageChromeReportOptions) => void;
	resetPageChrome: () => void;
}

const PageChromeContext = createContext<PageChromeContextValue | null>(null);


function clampCollapseProgress(scrollTop: number) {
	return Math.min(1, Math.max(0, scrollTop / COLLAPSE_DISTANCE));
}

function getCollapseProgress(
	scrollTop: number,
	options: PageChromeReportOptions,
	currentProgress: number,
) {
	if (options.preserveCollapsedUntilTop && currentProgress >= COLLAPSED_THRESHOLD) {
		const reopenDistance = options.reopenDistance ?? 48;
		return Math.min(1, Math.max(0, scrollTop / reopenDistance));
	}

	return clampCollapseProgress(scrollTop);
}

export function PageChromeProvider({ children }: { children: ReactNode }) {
	const [collapseProgress, setCollapseProgress] = useState(0);
	const [hasScrolled, setHasScrolled] = useState(false);
	const latestScrollTopRef = useRef(0);
	const hasScrolledRef = useRef(false);
	const latestOptionsRef = useRef<PageChromeReportOptions>({});
	const collapseProgressRef = useRef(0);
	const frameRef = useRef<number | null>(null);

	const reportScrollTop = useCallback((scrollTop: number, options: PageChromeReportOptions = {}) => {
		latestScrollTopRef.current = scrollTop;
		latestOptionsRef.current = options;
		const nextHasScrolled = scrollTop > 0;
		if (hasScrolledRef.current !== nextHasScrolled) {
			hasScrolledRef.current = nextHasScrolled;
			setHasScrolled(nextHasScrolled);
		}

		if (frameRef.current !== null) return;

		frameRef.current = window.requestAnimationFrame(() => {
			frameRef.current = null;
			setCollapseProgress(() => {
				const nextProgress = getCollapseProgress(
					latestScrollTopRef.current,
					latestOptionsRef.current,
					collapseProgressRef.current,
				);
				collapseProgressRef.current = nextProgress;
				return nextProgress;
			});
		});
	}, []);

	const resetPageChrome = useCallback(() => {
		latestScrollTopRef.current = 0;
		latestOptionsRef.current = {};
		collapseProgressRef.current = 0;
		hasScrolledRef.current = false;
		if (frameRef.current !== null) {
			window.cancelAnimationFrame(frameRef.current);
			frameRef.current = null;
		}
		setCollapseProgress(0);
		setHasScrolled(false);
	}, []);

	useEffect(() => {
		return () => {
			if (frameRef.current !== null) {
				window.cancelAnimationFrame(frameRef.current);
			}
		};
	}, []);

	const value = useMemo(
		() => ({
			collapseProgress,
			isCollapsed: collapseProgress >= COLLAPSED_THRESHOLD,
			hasScrolled,
			reportScrollTop,
			resetPageChrome,
		}),
		[collapseProgress, hasScrolled, reportScrollTop, resetPageChrome],
	);

	return (
		<PageChromeContext.Provider value={value}>
			{children}
		</PageChromeContext.Provider>
	);
}

export function usePageChrome() {
	const context = useContext(PageChromeContext);

	if (!context) {
		throw new Error("usePageChrome must be used inside PageChromeProvider.");
	}

	return context;
}

export function usePageChromeScroll() {
	const { reportScrollTop } = usePageChrome();

	return useCallback<UIEventHandler<HTMLElement>>(
		(event) => {
			reportScrollTop(event.currentTarget.scrollTop);
		},
		[reportScrollTop],
	);
}

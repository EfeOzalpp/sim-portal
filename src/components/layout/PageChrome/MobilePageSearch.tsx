"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import Button from "@/components/button";
import styles from "./PageChrome.module.css";

export default function MobilePageSearch({ children }: { children: ReactNode }) {
	const [isOpen, setIsOpen] = useState(false);
	const panelId = useId();
	const panelRef = useRef<HTMLDivElement>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		if (!isOpen) return;

		function onClickAway(event: MouseEvent) {
			const target = event.target;
			const panel = panelRef.current;
			if (!(target instanceof Node) || !panel || panel.contains(target) || buttonRef.current?.contains(target)) return;

			// Search filters can render their controlled popover outside the input's DOM tree.
			const insideFilter = Array.from(panel.querySelectorAll("[aria-controls]")).some((trigger) => {
				const id = trigger.getAttribute("aria-controls");
				return id && document.getElementById(id)?.contains(target);
			});
			if (!insideFilter) setIsOpen(false);
		}

		document.addEventListener("click", onClickAway, true);
		return () => document.removeEventListener("click", onClickAway, true);
	}, [isOpen]);

	function closeSearch() {
		setIsOpen(false);
		buttonRef.current?.focus();
	}

	return (
		<>
			<div
				ref={panelRef}
				id={panelId}
				role="search"
				data-page-search-panel
				hidden={!isOpen}
				className={styles.mobileSearchPanel}
				onKeyDown={(event) => {
					if (event.key === "Escape") {
						event.stopPropagation();
						closeSearch();
					}
				}}
			>
				{children}
			</div>
			<Button
				ref={buttonRef}
				surface="page"
				variant="tool"
				type="button"
				icon={isOpen ? "close/close.svg" : "search/search.svg"}
				aria-label={isOpen ? "Close search" : "Open search"}
				title={isOpen ? "Close search" : "Open search"}
				aria-expanded={isOpen}
				aria-controls={panelId}
				data-mobile-search-open={isOpen || undefined}
				onClick={() => {
					if (isOpen) {
						closeSearch();
					} else {
						// Reveal and focus within the tap so mobile browsers can open the keyboard.
						flushSync(() => setIsOpen(true));
						panelRef.current?.querySelector("input")?.focus();
					}
				}}
			/>
		</>
	);
}

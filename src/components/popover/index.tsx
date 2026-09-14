"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import * as RadixPopover from "@radix-ui/react-popover";
import clsx from "clsx";
import { popoverContentClassName } from "@/components/popover/styles";

export interface PopoverProps {
	/** The element that opens the popover on click - wrapped in Radix's asChild, so pass a real <button>. */
	trigger: ReactNode;
	children: ReactNode;
	/** Which side of the trigger the content opens on. */
	side?: "top" | "bottom" | "left" | "right";
	/** How the content lines up along that side. */
	align?: "start" | "center" | "end";
	sideOffset?: number;
	contentClassName?: string;
	/** Controlled open state - omit for the popover to manage its own. */
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	/**
	 * For a toggle-style option list (pick one of several, re-picking the
	 * current one is a no-op) - selecting an option shouldn't close this, so
	 * the consumer shouldn't close it on click either. Instead, this closes
	 * it once the pointer/focus leaves both the trigger and the content -
	 * polled rather than tracked via mouseenter/mouseleave, since those fire
	 * on incidental things (a click-triggered reflow, the gap between trigger
	 * and content) that don't actually mean "the pointer left".
	 */
	toggle?: boolean;
}

export function Popover({
	trigger,
	children,
	side = "bottom",
	align = "center",
	sideOffset = 8,
	contentClassName,
	open,
	onOpenChange,
	toggle,
}: PopoverProps) {
	const triggerRef = useRef<HTMLButtonElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!toggle || !open) return;

		let missCount = 0;

		const interval = setInterval(() => {
			const triggerEl = triggerRef.current;
			const contentEl = contentRef.current;
			const isHovering = !!(triggerEl?.matches(":hover") || contentEl?.matches(":hover"));
			const isFocusedInside = !!(triggerEl?.contains(document.activeElement) || contentEl?.contains(document.activeElement));

			if (isHovering || isFocusedInside) {
				missCount = 0;
				return;
			}

			missCount += 1;
			if (missCount >= 2) {
				onOpenChange?.(false);
			}
		}, 200);

		return () => clearInterval(interval);
	}, [toggle, open, onOpenChange]);

	return (
		<RadixPopover.Root open={open} onOpenChange={onOpenChange}>
			<RadixPopover.Trigger ref={triggerRef} asChild>
				{trigger}
			</RadixPopover.Trigger>
			<RadixPopover.Portal>
				<RadixPopover.Content
					ref={contentRef}
					side={side}
					align={align}
					sideOffset={sideOffset}
					className={clsx(popoverContentClassName, contentClassName)}
					onCloseAutoFocus={(event) => event.preventDefault()}
				>
					{children}
				</RadixPopover.Content>
			</RadixPopover.Portal>
		</RadixPopover.Root>
	);
}

export default Popover;

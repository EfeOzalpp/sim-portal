"use client";

import { useCallback, useEffect, useState, type ComponentProps } from "react";
import * as RadixPopover from "@radix-ui/react-popover";
import { POPOVER_DISMISS_EVENT } from "./dismiss";

export function PopoverRoot({ open: controlledOpen, defaultOpen = false, onOpenChange, ...props }: ComponentProps<typeof RadixPopover.Root>) {
	const [internalOpen, setInternalOpen] = useState(defaultOpen);
	const open = controlledOpen ?? internalOpen;
	const changeOpen = useCallback((next: boolean) => {
		if (controlledOpen === undefined) setInternalOpen(next);
		onOpenChange?.(next);
	}, [controlledOpen, onOpenChange]);

	useEffect(() => {
		if (!open) return;
		const dismiss = () => changeOpen(false);
		window.addEventListener(POPOVER_DISMISS_EVENT, dismiss);
		return () => window.removeEventListener(POPOVER_DISMISS_EVENT, dismiss);
	}, [open, changeOpen]);

	return <RadixPopover.Root {...props} open={open} onOpenChange={changeOpen} />;
}

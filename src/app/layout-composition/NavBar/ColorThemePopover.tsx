"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import Popover from "@/components/popover";
import Button from "@/components/button";
import { selectItemVariants } from "@/components/select/styles";

type ColorTheme = "default" | "purple-green";

// Order here is the order shown in the popover - Default listed first, matching
// it being the actual fallback (layout.tsx's <html> default + colorThemeInitScript).
const colorThemeOptions: { id: ColorTheme; label: string }[] = [
	{ id: "default", label: "Default" },
	{ id: "purple-green", label: "Purple & Green" },
];

function readColorTheme(): ColorTheme {
	return document.documentElement.dataset.colorTheme === "purple-green" ? "purple-green" : "default";
}

const optionButtonClassName = "w-full border-0 bg-transparent text-left hover:bg-[var(--modal-button-bg-hover)]!";

export default function ColorThemePopover() {
	const [open, setOpen] = useState(false);
	const [colorTheme, setColorTheme] = useState<ColorTheme>("default");

	// Mirrors ThemeSwitch's own mount-time read + MutationObserver - keeps this
	// in sync with data-color-theme regardless of what changed it (this popover,
	// ThemeStorageSync's init read, or anything else).
	useEffect(() => {
		const root = document.documentElement;
		setColorTheme(readColorTheme());

		const observer = new MutationObserver(() => setColorTheme(readColorTheme()));
		observer.observe(root, { attributes: true, attributeFilter: ["data-color-theme"] });
		return () => observer.disconnect();
	}, []);

	function handleSelect(id: ColorTheme) {
		if (id === colorTheme) return;

		const root = document.documentElement;

		// Suppress transitions for one frame so colors snap instantly (see styling-theme.css).
		root.classList.add("theme-toggle-in-progress");
		root.dataset.colorTheme = id;
		setColorTheme(id);

		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				root.classList.remove("theme-toggle-in-progress");
			});
		});
	}

	return (
		<Popover
			side="top"
			align="start"
			open={open}
			onOpenChange={setOpen}
			toggle
			trigger={
				<Button
					variant="icon"
					icon="color/brush.svg"
					aria-label="Color theme"
					// variant="icon" is shared with plain page buttons elsewhere
					// (SemesterCardGrid/UserCard/GridViewPopover/ProductionsCollapse),
					// so its own --button-* tokens are page-based by design - this is
					// the one instance that lives in the nav rail, so it needs the
					// same mainframe nav-area tokens ThemeSwitch (variant="nav") right
					// next to it already uses, not the generic page-button colors.
					// data-[state=open]: Radix's own Popover.Trigger sets this on the
					// element asChild clones onto - no need to thread `open` through
					// manually. Same --nav-active-bg/-text pair variant="nav" uses for
					// aria-[current=page], so an open popover reads the same way an
					// active nav link does.
					className="border-transparent! bg-transparent! text-[var(--app-icon)]! hover:border-transparent! hover:bg-[var(--nav-hover-bg)]! hover:text-[var(--app-icon)]! focus-visible:outline-[var(--app-theme)]! active:outline-[var(--app-theme)]! data-[state=open]:bg-[var(--nav-active-bg)]! data-[state=open]:text-[var(--nav-active-text)]! data-[state=open]:hover:bg-[var(--nav-active-bg)]! data-[state=open]:hover:text-[var(--nav-active-text)]!"
				/>
			}
		>
			<div className="flex min-w-[10rem] flex-col gap-0.5">
				<span className="ui-label block px-2 pt-0.5 pb-1">Color</span>
				<div className="flex flex-col gap-0.5" role="listbox">
					{colorThemeOptions.map((option) => (
						<button
							key={option.id}
							type="button"
							role="option"
							aria-selected={colorTheme === option.id}
							className={clsx(selectItemVariants({ selected: colorTheme === option.id }), optionButtonClassName)}
							onClick={() => handleSelect(option.id)}
						>
							{option.label}
						</button>
					))}
				</div>
			</div>
		</Popover>
	);
}

"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import Popover from "@/components/popover";
import { selectItemVariants } from "@/components/select/styles";
import { MaskIcon } from "@/theme/MaskIcon";

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

// Same small square icon-only trigger as RoleFilterPopover's.
const triggerClassName =
	"m-0 inline-grid h-9 w-9 flex-none cursor-pointer place-items-center rounded-xl border border-solid border-[var(--input-border)] bg-[var(--btn-default-bg)] p-0 text-[var(--input-icon)] hover:border-[var(--input-border-hover)] hover:bg-[var(--input-bg-hover)] hover:text-[var(--input-text)] hover:shadow-[var(--input-hover-shadow)]";

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
				<button type="button" className={triggerClassName} aria-label="Color theme">
					<MaskIcon icon="color/brush.svg" className="h-4 w-4 bg-current [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]" />
				</button>
			}
		>
			<div className="flex min-w-[10rem] flex-col gap-0.5">
				<span className="ui-label block px-2 pb-1">Color</span>
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

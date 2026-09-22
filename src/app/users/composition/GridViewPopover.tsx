"use client";

import { useURLFilter } from "@/hooks/useURLFilter";
import Popover from "@/components/popover";
import Button from "@/components/button";
import { CARDS_PER_ROW_KEY, DEFAULT_CARDS_PER_ROW, MIN_CARDS_PER_ROW, MAX_CARDS_PER_ROW } from "@/constants/filters";

// Bare <input type="range"> - Tailwind can't reach the thumb/track through
// normal utilities, only through these pseudo-element arbitrary variants.
const rangeInputClassName = [
	"h-4 w-full cursor-pointer appearance-none bg-transparent",
	"[&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-[var(--input-border)]",
	"[&::-moz-range-track]:h-1.5 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-[var(--input-border)]",
	"[&::-webkit-slider-thumb]:mt-[-0.3125rem] [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-none [&::-webkit-slider-thumb]:bg-[var(--select-checkbox-active-bg)]",
	"[&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:bg-[var(--select-checkbox-active-bg)]",
	// Falls back to the same active-bg if a theme hasn't defined its own hovered-bg yet.
	"hover:[&::-webkit-slider-thumb]:bg-[var(--select-checkbox-hovered-bg,var(--select-checkbox-active-bg))]",
	"hover:[&::-moz-range-thumb]:bg-[var(--select-checkbox-hovered-bg,var(--select-checkbox-active-bg))]",
].join(" ");

export default function GridViewPopover() {
	const { value, handleChange } = useURLFilter(CARDS_PER_ROW_KEY, 200);
	const cardsPerRow = Number(value) || DEFAULT_CARDS_PER_ROW;

	return (
		<Popover
			align="start"
			trigger={<Button variant="icon" icon="grid_view/grid_view.svg" aria-label="Grid view" />}
		>
			<div className="flex min-w-[12rem] flex-col gap-2 p-2">
				<div className="flex items-center justify-between gap-2">
					<span className="ui-label">Cards per row</span>
					<span className="text-[var(--app-text)]">{cardsPerRow}</span>
				</div>
				<input
					type="range"
					min={MIN_CARDS_PER_ROW}
					max={MAX_CARDS_PER_ROW}
					step={1}
					value={cardsPerRow}
					onChange={(event) => handleChange(event.target.value)}
					className={rangeInputClassName}
					aria-label="Cards per row"
				/>
			</div>
		</Popover>
	);
}

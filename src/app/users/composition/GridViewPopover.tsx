"use client";

import { useEffect, useState } from "react";
import { usePeopleGridPreference } from "@/app/users/composition/usePeopleGridPreference";
import Popover from "@/components/popover";
import Button from "@/components/button";

// Bare <input type="range"> - Tailwind can't reach the thumb/track through
// normal utilities, only through these pseudo-element arbitrary variants.
const rangeInputClassName = [
	"-my-2 h-10 w-full cursor-pointer appearance-none bg-transparent py-2 touch-pan-x max-[768px]:-my-4 max-[768px]:h-14 max-[768px]:py-4",
	"[&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-[var(--lines-color)]",
	"[&::-moz-range-track]:h-1.5 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-[var(--lines-color)]",
	"[&::-webkit-slider-thumb]:mt-[-0.3125rem] [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-none [&::-webkit-slider-thumb]:bg-[var(--select-checkbox-active-bg)]",
	"[&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:bg-[var(--select-checkbox-active-bg)]",
	"max-[768px]:[&::-webkit-slider-thumb]:mt-[-1.0625rem] max-[768px]:[&::-webkit-slider-thumb]:h-9 max-[768px]:[&::-webkit-slider-thumb]:w-9 max-[768px]:[&::-webkit-slider-thumb]:border-none max-[768px]:[&::-webkit-slider-thumb]:[background:radial-gradient(circle,var(--select-checkbox-active-bg)_0_38%,transparent_39%)] max-[768px]:[&::-webkit-slider-thumb]:shadow-none max-[768px]:[&::-webkit-slider-thumb]:outline-none max-[768px]:[&::-webkit-slider-thumb]:[filter:none]",
	"max-[768px]:[&::-moz-range-thumb]:h-9 max-[768px]:[&::-moz-range-thumb]:w-9 max-[768px]:[&::-moz-range-thumb]:border-none max-[768px]:[&::-moz-range-thumb]:[background:radial-gradient(circle,var(--select-checkbox-active-bg)_0_38%,transparent_39%)] max-[768px]:[&::-moz-range-thumb]:shadow-none max-[768px]:[&::-moz-range-thumb]:outline-none max-[768px]:[&::-moz-range-thumb]:[filter:none]",
	// Falls back to the same active-bg if a theme hasn't defined its own hovered-bg yet.
	"hover:[&::-webkit-slider-thumb]:bg-[var(--select-checkbox-hovered-bg,var(--select-checkbox-active-bg))]",
	"hover:[&::-moz-range-thumb]:bg-[var(--select-checkbox-hovered-bg,var(--select-checkbox-active-bg))]",
].join(" ");

export default function GridViewPopover() {
	const { cardsPerRow, setColumns, minCardsPerRow, maxCardsPerRow } = usePeopleGridPreference();
	const [sliderValue, setSliderValue] = useState(cardsPerRow);

	useEffect(() => {
		setSliderValue(cardsPerRow);
	}, [cardsPerRow]);

	function handleSliderChange(nextValue: string) {
		const nextSliderValue = Number(nextValue);
		const nextCardsPerRow = Math.min(Math.max(Math.round(nextSliderValue), minCardsPerRow), maxCardsPerRow);

		setSliderValue(nextSliderValue);
		setColumns(nextCardsPerRow);
	}

	return (
		<Popover
			align="start"
			trigger={
				<Button
					surface="page"
					variant="tool"
					icon="grid_view/grid_view.svg"
					aria-label="Grid view"
				/>
			}
		>
			<div className="flex min-w-[12rem] flex-col gap-2 px-4 py-2">
				<div className="flex items-center justify-between gap-2">
					<span className="ui-label">Cards per row</span>
					<span className="text-[var(--label-text)]">{cardsPerRow}</span>
				</div>
				<input
					type="range"
					min={minCardsPerRow}
					max={maxCardsPerRow}
					step={0.01}
					value={sliderValue}
					onChange={(event) => handleSliderChange(event.target.value)}
					className={rangeInputClassName}
					aria-label="Cards per row"
				/>
			</div>
		</Popover>
	);
}

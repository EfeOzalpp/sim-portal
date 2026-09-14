"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import clsx from "clsx";
import Popover from "@/components/popover";
import { selectItemVariants } from "@/components/select/styles";
import { MaskIcon } from "@/theme/MaskIcon";
import { DEFAULT_SEMESTER_SORT, SEMESTER_SORT_KEY, type SemesterSortValue } from "@/constants/filters";

const arrowIconClassName = "h-3.5 w-3.5 flex-none bg-current [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]";

const sortOptions: { value: SemesterSortValue; label: string; icon?: React.ReactNode }[] = [
	{ value: "recent", label: "Recent → Older" },
	{ value: "oldest", label: "Older → Recent" },
	{ value: "enrollmentHigh", label: "Enrollment (High to Low)", icon: <MaskIcon icon="view/forward.svg" className={clsx(arrowIconClassName, "-rotate-90")} /> },
	{ value: "enrollmentLow", label: "Enrollment (Low to High)", icon: <MaskIcon icon="view/forward.svg" className={clsx(arrowIconClassName, "rotate-90")} /> },
];

const triggerClassName =
	"m-0 inline-grid h-9 w-9 cursor-pointer place-items-center rounded-xl border border-solid border-[var(--green-select-border)] bg-[var(--green-select-bg)] p-0 text-[var(--green-text)] hover:bg-[var(--green-select-bg-hover)]";

const optionButtonClassName = "w-full border-0 bg-transparent text-left hover:bg-[var(--modal-button-bg-hover)]!";

export default function SemesterSortPopover() {
	const [open, setOpen] = useState(false);
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const router = useRouter();
	const [, startTransition] = useTransition();
	const currentSort = (searchParams.get(SEMESTER_SORT_KEY) as SemesterSortValue) || DEFAULT_SEMESTER_SORT;

	function selectSort(value: SemesterSortValue) {
		const params = new URLSearchParams(searchParams.toString());
		if (value === DEFAULT_SEMESTER_SORT) params.delete(SEMESTER_SORT_KEY);
		else params.set(SEMESTER_SORT_KEY, value);

		startTransition(() => {
			router.replace(`${pathname}?${params.toString()}`, { scroll: false });
		});
		setOpen(false);
	}

	return (
		<Popover
			align="start"
			open={open}
			onOpenChange={setOpen}
			trigger={
				<button type="button" className={triggerClassName} aria-label="Sort semesters">
					<MaskIcon icon="filter/filter.svg" className="h-4 w-4 bg-current [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]" />
				</button>
			}
		>
			<div className="flex min-w-[11rem] flex-col gap-0.5">
				<span className="ui-label block px-2 pb-1">Sort By</span>
				<div className="flex flex-col gap-0.5" role="listbox">
					{sortOptions.map((option) => {
						const isSelected = currentSort === option.value;
						return (
							<button
								key={option.value}
								type="button"
								role="option"
								aria-selected={isSelected}
								onClick={() => selectSort(option.value)}
								className={clsx(selectItemVariants({ selected: isSelected }), optionButtonClassName, "flex items-center gap-2")}
							>
								{option.icon}
								{option.label}
							</button>
						);
					})}
				</div>
			</div>
		</Popover>
	);
}

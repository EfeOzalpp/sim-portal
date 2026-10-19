"use client";

import Link from "next/link";
import { Button } from "@/components/button";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useOptionalActionMode } from "@/components/layout/ActionMode";
import { ThursdayCheckbox, useSelectedThursdays } from "@/app/thursdays/composition/selection/SelectedThursdaysProvider";
import ThursdayProducerAvatarStack, { type ThursdayProducerPreview } from "@/app/thursdays/composition/ThursdayProducerAvatarStack";
import { MaskIcon } from "@/theme/MaskIcon";
import { ACTION_MODES } from "@/constants/action-modes";
import { THURSDAY_MODAL_PARAMS, type ThursdayModalParam } from "@/constants/modal-params";
import { getStringColors } from "@/constants/stringColors";
import ThursdayDateIndicator from "@/app/thursdays/composition/ThursdayDateIndicator";

interface ThursdayGridCardProps {
	id: string;
	name: string;
	date: string;
	calendarDate: string;
	href: string;
	productionCount: number;
	presentationCount: number;
	producerCount: number;
	producerPreviews?: ThursdayProducerPreview[];
	isEmpty?: boolean;
	isAdmin?: boolean;
}

function DateLabel({ date }: { date: string }) {
	const colors = getStringColors(date);

	return (
		<span
			className="ui-label m-0 block w-fit border-0 border-b border-solid bg-transparent px-0 pb-0.5 font-sans text-xs leading-tight font-semibold uppercase"
			style={{ borderBottomColor: colors.bg, color: colors.text }}
		>
			{date}
		</span>
	);
}

export default function ThursdayGridCard({
	id,
	name,
	date,
	calendarDate,
	href,
	productionCount,
	presentationCount,
	producerCount,
	producerPreviews,
	isEmpty = false,
	isAdmin = false,
}: ThursdayGridCardProps) {
	const { activeMode } = useOptionalActionMode();
	const { selectedThursdayIds, setSelectedThursdayIds } = useSelectedThursdays();
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const isSelected = selectedThursdayIds.has(id);

	function openThursdayModal(modalParam: ThursdayModalParam) {
		const params = new URLSearchParams(searchParams.toString());
		params.delete(THURSDAY_MODAL_PARAMS.add);
		params.delete(THURSDAY_MODAL_PARAMS.view);
		params.delete(THURSDAY_MODAL_PARAMS.edit);
		params.delete(THURSDAY_MODAL_PARAMS.delete);
		params.set(modalParam, id);
		router.push(`${pathname}?${params.toString()}`, { scroll: false });
	}

	function handleActionModeClick() {
		if (activeMode === ACTION_MODES.editThursdays) {
			openThursdayModal(THURSDAY_MODAL_PARAMS.edit);
			return true;
		}

		if (activeMode === ACTION_MODES.deleteThursdays) {
			openThursdayModal(THURSDAY_MODAL_PARAMS.delete);
			return true;
		}

		return false;
	}

	function toggleThursday() {
		const next = new Set(selectedThursdayIds);

		if (next.has(id)) {
			next.delete(id);
		} else {
			next.add(id);
		}

		setSelectedThursdayIds(next);
	}

	return (
		<article
			className="group relative mx-auto min-h-36 w-[90%] overflow-hidden rounded-none bg-transparent text-[var(--app-text)] transition-[background] duration-150 before:absolute before:right-0 before:bottom-0 before:left-0 before:h-0.5 before:bg-[var(--card-border)] before:transition-colors before:duration-150 hover:bg-[var(--page-card-hover)] hover:before:bg-[var(--card-border-hover)]"
			data-action-mode-target="thursday-card"
			data-thursday-id={id}
			onClickCapture={(event) => {
				if (!handleActionModeClick()) return;

				event.preventDefault();
				event.stopPropagation();
			}}
		>
			<div className="absolute top-2 right-2 z-[3] flex min-h-8 items-center gap-2 print:hidden">
				{isAdmin && !activeMode && (
					<div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 [--page-icon-bg:var(--button-overlay-bg)] [--page-icon-shadow:var(--button-overlay-shadow)] [--page-icon-bg-hover:var(--button-overlay-bg-hover)]">
						<Button surface="page" variant="tool" type="button" icon="edit/edit.svg" aria-label={`Edit ${name}`} onClick={() => openThursdayModal(THURSDAY_MODAL_PARAMS.edit)} />
						<Button surface="page" variant="tool" tone="danger" type="button" icon="delete/delete.svg" aria-label={`Delete ${name}`} className="[--page-icon-bg-hover:var(--button-delete-overlay-bg-hover)] [--button-danger-icon-text:var(--button-delete-overlay-text)]" onClick={() => openThursdayModal(THURSDAY_MODAL_PARAMS.delete)} />
					</div>
				)}
				<span className="pointer-events-none absolute top-0 right-0 flex min-h-8 items-center">
					<ThursdayDateIndicator date={calendarDate} />
				</span>
			</div>
			<Link href={href} scroll={false} className="flex h-full min-h-36 flex-col gap-4 px-4 pt-3 no-underline">
				<div className="flex min-w-0 items-center gap-3 max-[768px]:pt-10 min-[769px]:pr-28">
					<span className="relative z-[2] flex flex-none items-center">
						<ThursdayCheckbox
							checked={isSelected}
							ariaLabel={`Select ${name}`}
							onChange={toggleThursday}
						/>
					</span>
					<DateLabel date={date} />
				</div>
				<h3 className="m-0 min-w-0 text-[var(--app-text)]" title={name}>
					{name}
				</h3>
				{isEmpty ? (
					<div className="mt-auto pb-4 text-sm italic text-[var(--content-muted)]">Empty</div>
				) : (
					<div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pb-4 text-sm text-[var(--subtle-text)]">
						<span>{productionCount} prod.</span>
						<span>{presentationCount} pres.</span>
						<ThursdayProducerAvatarStack producerCount={producerCount} producerPreviews={producerPreviews} />
					</div>
				)}
				{!activeMode && (
					<span className="pointer-events-none absolute top-1/2 right-5 flex -translate-y-1/2 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100" aria-hidden="true">
						<MaskIcon icon="view/forward.svg" className="h-5 w-5 flex-none bg-[var(--app-text)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]" />
					</span>
				)}
			</Link>
			<span
				className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center text-[var(--app-text)] opacity-0"
				data-thursday-action-overlay
				aria-hidden="true"
			>
				<span className="h-7 w-7 origin-center scale-100" />
			</span>
		</article>
	);
}

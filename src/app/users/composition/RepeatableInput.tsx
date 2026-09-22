"use client";

// Components
import { Input, InputProps } from "@/components/input";

// Helpers
import clsx from "clsx";
import addIcon from "@/theme/assets/add/add.svg";
import deleteIcon from "@/theme/assets/delete/delete.svg";

interface RepeatableInputProps extends Omit<InputProps, "value" | "onChange"> {
	value?: string[];
	onChange?: (value: string[]) => void;
	addLabel?: string;
	deleteLabel?: string;
}

function normalizeRows(value?: string[]) {
	return value && value.length > 0 ? value : [""];
}

export default function RepeatableInput({
	value,
	onChange,
	addLabel = "Add item",
	deleteLabel = "Remove item",
	id,
	...inputProps
}: RepeatableInputProps) {
	const rows = normalizeRows(value);

	function updateRow(index: number, nextValue: string) {
		const nextRows = [...rows];
		nextRows[index] = nextValue;
		onChange?.(nextRows);
	}

	function addRow() {
		onChange?.([...rows, ""]);
	}

	function deleteRow(index: number) {
		const nextRows = rows.filter((_, rowIndex) => rowIndex !== index);
		onChange?.(normalizeRows(nextRows));
	}

	return (
		<div className="flex w-full min-w-0 flex-col gap-2">
			{rows.map((rowValue, index) => {
				const isFirst = index === 0;
				const icon = isFirst ? addIcon : deleteIcon;
				const iconUrl = typeof icon === "string" ? icon : icon.src;
				// Add matches the input chevron's own color/weight (bg-[var(--input-icon)])
				// directly, rather than currentColor - delete reuses the same red as
				// the "Delete Users" nav button (--action-delete-text isn't really
				// ActionMode-only, it's just the well-tuned delete-semantic red).
				const iconColorClassName = isFirst ? "bg-[var(--input-icon)]" : "bg-[var(--action-delete-text)]";
					// Delete's hover border matches its own icon red instead of the
					// neutral input-border-hover every other icon button uses.
					const hoverBorderClassName = isFirst ? "hover:border-[var(--input-border-hover)]" : "hover:border-[var(--action-delete-text)]";

				return (
					<div
						className={clsx(
							"grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2",
							index > 0 && "pr-5",
						)}
						key={index}
					>
						<Input
							{...inputProps}
							id={id ? `${id}-${index}` : undefined}
							value={rowValue}
							onChange={(event) => updateRow(index, event.target.value)}
						/>
						<button
							type="button"
							className={clsx(
								"m-0 inline-grid h-9 w-9 cursor-pointer place-items-center self-center rounded-xl border-solid border-[var(--button-border)] bg-[var(--button-bg)] p-0 text-[var(--input-icon)] border hover:bg-[var(--button-bg-hover)]",
								hoverBorderClassName,
							)}
							aria-label={isFirst ? addLabel : deleteLabel}
							onClick={isFirst ? addRow : () => deleteRow(index)}
						>
							<span
								className={clsx(
									"h-4 w-4 [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]",
									iconColorClassName,
								)}
								style={{
									maskImage: `url(${iconUrl})`,
									WebkitMaskImage: `url(${iconUrl})`,
								}}
								aria-hidden="true"
							/>
						</button>
					</div>
				);
			})}
		</div>
	);
}

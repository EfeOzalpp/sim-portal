"use client";

import { Input } from "@/components/primitives/AntD";
import type { InputProps } from "antd";
import clsx from "clsx";
import addIcon from "@/components/theme/assets/add/add.svg";
import deleteIcon from "@/components/theme/assets/delete/delete.svg";

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
		<div className="flex w-full min-w-0 flex-col gap-[var(--gap-sm)]">
			{rows.map((rowValue, index) => {
				const isFirst = index === 0;
				const icon = isFirst ? addIcon : deleteIcon;
				const iconUrl = typeof icon === "string" ? icon : icon.src;

				return (
					<div
						className={clsx(
							"grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-[var(--gap-sm)]",
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
							className="m-0 inline-grid h-9 w-9 cursor-pointer place-items-center self-center rounded-[var(--border-md)] border-solid border-[var(--input-border)] bg-transparent p-0 text-[var(--input-icon)] [border-width:var(--app-border-width)] hover:border-[var(--input-border-hover)] hover:bg-[var(--input-bg-hover)] hover:text-[var(--input-text)] hover:shadow-[var(--input-hover-shadow)]"
							aria-label={isFirst ? addLabel : deleteLabel}
							onClick={isFirst ? addRow : () => deleteRow(index)}
						>
							<span
								className="h-3.5 w-3.5 bg-current [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]"
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

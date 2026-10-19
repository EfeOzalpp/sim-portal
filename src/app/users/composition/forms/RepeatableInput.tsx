"use client";

// Components
import { Input, InputProps } from "@/components/input";
import { inputActionButtonClassName } from "@/components/input/styles";
import { MaskIcon } from "@/theme/MaskIcon";

// Helpers
import clsx from "clsx";

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

				return (
					<Input
						{...inputProps}
						key={index}
						id={id ? `${id}-${index}` : undefined}
						value={rowValue}
						onChange={(event) => updateRow(index, event.target.value)}
						mode="action"
						action={
							<button
								type="button"
								className={clsx(inputActionButtonClassName, !isFirst && "text-[var(--action-delete-text)]!")}
								aria-label={isFirst ? addLabel : deleteLabel}
								onClick={isFirst ? addRow : () => deleteRow(index)}
							>
								<MaskIcon
									icon={isFirst ? "add/add.svg" : "delete/delete.svg"}
									className="h-5 w-5 bg-current [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]"
								/>
							</button>
						}
					/>
				);
			})}
		</div>
	);
}

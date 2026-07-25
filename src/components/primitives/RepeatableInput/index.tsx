"use client";

import { Input } from "@/components/primitives/AntD";
import type { InputProps } from "antd";
import styles from "@/components/primitives/RepeatableInput/RepeatableInput.module.css";

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
		<div className={styles.root}>
			{rows.map((rowValue, index) => {
				const isFirst = index === 0;

				return (
					<div className={styles.row} key={index}>
						<Input
							{...inputProps}
							id={id ? `${id}-${index}` : undefined}
							value={rowValue}
							onChange={(event) => updateRow(index, event.target.value)}
						/>
						<button
							type="button"
							className={styles.iconButton}
							aria-label={isFirst ? addLabel : deleteLabel}
							onClick={isFirst ? addRow : () => deleteRow(index)}
						>
							<span
								className={`${styles.icon} ${isFirst ? styles.addIcon : styles.deleteIcon}`}
								aria-hidden="true"
							/>
						</button>
					</div>
				);
			})}
		</div>
	);
}

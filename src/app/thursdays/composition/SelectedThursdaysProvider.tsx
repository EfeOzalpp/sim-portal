"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState } from "react";
import { MaskIcon } from "@/theme/MaskIcon";

interface SelectedThursdaysContextValue {
	selectedThursdayIds: Set<string>;
	setSelectedThursdayIds: (next: Set<string>) => void;
}

const SelectedThursdaysContext = createContext<SelectedThursdaysContextValue | null>(null);

const checkboxInputClassName =
	"h-4 w-4 cursor-pointer appearance-none rounded-xs border-2 border-solid border-[var(--page-checkbox-border)] bg-transparent hover:border-[var(--page-checkbox-border-hover)] focus-visible:border-[var(--page-checkbox-border-hover)]";
const checkboxHitAreaClassName =
	"relative inline-flex h-8 w-8 flex-none cursor-pointer items-center justify-center rounded-full transition-colors duration-150 hover:bg-[var(--page-checkbox-hover-bg)] focus-within:bg-[var(--page-checkbox-hover-bg)] active:bg-[var(--page-checkbox-checked-bg)] max-[768px]:h-10 max-[768px]:w-10";
const checkmarkClassName = "pointer-events-none absolute inset-0 h-4 w-4 bg-[var(--page-checkbox-checkmark)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:85%]";
const checkedCheckboxStyle = {
	backgroundColor: "var(--page-checkbox-checked-bg)",
	borderColor: "var(--page-checkbox-checked-bg)",
};

export function useSelectedThursdays() {
	const context = useContext(SelectedThursdaysContext);

	if (!context) {
		throw new Error("useSelectedThursdays must be used inside SelectedThursdaysProvider.");
	}

	return context;
}

export function SelectedThursdaysProvider({ children }: { children: ReactNode }) {
	const [selectedThursdayIds, setSelectedThursdayIds] = useState<Set<string>>(new Set());
	const contextValue = useMemo(() => ({ selectedThursdayIds, setSelectedThursdayIds }), [selectedThursdayIds]);

	return <SelectedThursdaysContext.Provider value={contextValue}>{children}</SelectedThursdaysContext.Provider>;
}

export function ThursdayCheckbox({
	checked,
	indeterminate = false,
	onChange,
	ariaLabel,
}: {
	checked: boolean;
	indeterminate?: boolean;
	onChange: () => void;
	ariaLabel: string;
}) {
	const ref = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (ref.current) ref.current.indeterminate = indeterminate;
	}, [indeterminate]);

	return (
		<label className={checkboxHitAreaClassName} onClick={(event) => event.stopPropagation()}>
			<span className="relative inline-flex h-4 w-4 flex-none">
				<input
					ref={ref}
					type="checkbox"
					className={checkboxInputClassName}
					checked={checked}
					aria-label={ariaLabel}
					style={checked ? checkedCheckboxStyle : undefined}
					onChange={onChange}
				/>
				{checked && <MaskIcon icon="check/check.svg" className={checkmarkClassName} />}
			</span>
			{!checked && indeterminate && (
				<span className="pointer-events-none absolute inset-0 m-auto h-px w-2 bg-[var(--page-checkbox-checkmark)]" aria-hidden="true" />
			)}
		</label>
	);
}

"use client";

import { createContext, useContext, useEffect, type Dispatch, type SetStateAction } from "react";

export interface ModalCloseGuardState {
	isDirty: boolean;
	canSave: boolean;
	onSave: () => void;
}

const ModalCloseGuardContext = createContext<Dispatch<SetStateAction<ModalCloseGuardState | null>> | null>(null);

export const ModalCloseGuardProvider = ModalCloseGuardContext.Provider;

// A form rendered inside a ModalPopup calls this to report whether it has
// unsaved changes and how to submit itself - the modal reads this to decide
// whether a backdrop click should close right away or show the "keep editing
// / save changes / exit view" guard instead. A no-op when there's no
// ModalPopup ancestor providing this context (e.g. ConfirmDelete, which has no
// form state worth protecting and deliberately doesn't opt in).
export function useModalCloseGuard(isDirty: boolean, canSave: boolean, onSave: () => void) {
	const setGuardState = useContext(ModalCloseGuardContext);

	useEffect(() => {
		if (!setGuardState) return;

		setGuardState({ isDirty, canSave, onSave });
		return () => setGuardState(null);
	}, [setGuardState, isDirty, canSave, onSave]);
}

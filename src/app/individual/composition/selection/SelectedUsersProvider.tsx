"use client";

import { createContext, ReactNode, useContext, useMemo, useState } from "react";

interface SelectedUsersContextValue {
	selectedUserIds: Set<string>;
	setSelectedUserIds: (next: Set<string>) => void;
}

const SelectedUsersContext = createContext<SelectedUsersContextValue | null>(null);

export function useSelectedUsers() {
	const context = useContext(SelectedUsersContext);

	if (!context) {
		throw new Error("useSelectedUsers must be used inside SelectedUsersProvider.");
	}

	return context;
}

export function SelectedUsersProvider({ children }: { children: ReactNode }) {
	const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
	const contextValue = useMemo(() => ({ selectedUserIds, setSelectedUserIds }), [selectedUserIds]);

	return <SelectedUsersContext.Provider value={contextValue}>{children}</SelectedUsersContext.Provider>;
}

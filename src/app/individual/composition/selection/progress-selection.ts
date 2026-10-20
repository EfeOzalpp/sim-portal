export interface ProgressSelectionUser {
	id: string;
	name: string | null;
	email?: string | null;
	productions?: readonly unknown[];
	presentationsBeforeMid?: readonly unknown[];
	presentationsAfterMid?: readonly unknown[];
}

export const PROGRESS_SELECTION_FILTERS = [
	{ value: "no-presentations", label: "No presentations", kind: "presentations", hasWork: false },
	{ value: "no-productions", label: "No productions", kind: "productions", hasWork: false },
	{ value: "with-presentations", label: "With presentations", kind: "presentations", hasWork: true },
	{ value: "with-productions", label: "With productions", kind: "productions", hasWork: true },
] as const;

export type ProgressSelectionFilter = (typeof PROGRESS_SELECTION_FILTERS)[number]["value"];

export function matchingProgressUserIds(users: readonly ProgressSelectionUser[], filters: readonly ProgressSelectionFilter[]) {
	if (filters.length === 0) return new Set<string>();
	const rules = PROGRESS_SELECTION_FILTERS.filter((option) => filters.includes(option.value));
	return new Set(users.filter((user) => {
		// OR within each work type, AND between presentations and productions.
		return (["presentations", "productions"] as const).every((kind) => {
			const choices = rules.filter((rule) => rule.kind === kind);
			const hasWork = kind === "productions"
				? (user.productions?.length ?? 0) > 0
				: (user.presentationsBeforeMid?.length ?? 0) + (user.presentationsAfterMid?.length ?? 0) > 0;
			return choices.length === 0 || choices.some((rule) => rule.hasWork === hasWork);
		});
	}).map((user) => user.id));
}

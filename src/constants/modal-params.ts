// Single source of truth for the URL search-param name each route modal
// opens on - re-typed as a raw string in multiple files otherwise.
export const USER_MODAL_PARAMS = {
	add: "addUser",
	edit: "editUserId",
	profile: "profileUserId",
	delete: "deleteUserId",
} as const;

export const THURSDAY_MODAL_PARAMS = {
	add: "addThursday",
	view: "thursdayId",
	edit: "editThursdayId",
	delete: "deleteThursdayId",
} as const;

export const SEMESTER_MODAL_PARAMS = {
	add: "addSemester",
	edit: "editSemesterId",
	delete: "deleteSemesterId",
} as const;

// Not page-scoped like the above - these can appear in the URL on any page,
// since the account modals render from the root layout.
export const ACCOUNT_MODAL_PARAMS = {
	profile: "accountProfile",
	edit: "accountEdit",
} as const;

export type UserModalParam = (typeof USER_MODAL_PARAMS)[keyof typeof USER_MODAL_PARAMS];
export type ThursdayModalParam = (typeof THURSDAY_MODAL_PARAMS)[keyof typeof THURSDAY_MODAL_PARAMS];
export type SemesterModalParam = (typeof SEMESTER_MODAL_PARAMS)[keyof typeof SEMESTER_MODAL_PARAMS];
export type AccountModalParam = (typeof ACCOUNT_MODAL_PARAMS)[keyof typeof ACCOUNT_MODAL_PARAMS];

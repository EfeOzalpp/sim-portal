// Single source of truth for the action-mode identifiers ActionModeSurface/
// ActionModeButton coordinate through. ActionMode.module.css mirrors these
// same strings in its [data-action-mode="..."] selectors - keep both in sync.
export const ACTION_MODES = {
	editUsers: "edit-users",
	deleteUsers: "delete-users",
	editThursdays: "edit-thursdays",
	deleteThursdays: "delete-thursdays",
	editSemesters: "edit-semesters",
	deleteSemesters: "delete-semesters",
	editGrades: "edit-grades",
} as const;

export type ActionMode = (typeof ACTION_MODES)[keyof typeof ACTION_MODES];

// Modes whose button renders in the "danger" tone and whose card overlay
// shows the delete icon rather than the edit icon.
export const DELETE_ACTION_MODES: ActionMode[] = [
	ACTION_MODES.deleteUsers,
	ACTION_MODES.deleteThursdays,
	ACTION_MODES.deleteSemesters,
];

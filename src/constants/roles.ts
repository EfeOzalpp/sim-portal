import type { Role } from "@prisma/client";

// Single source of truth for the three role values and the checks on them.
// Kept out of helpers.tsx so Edge middleware (proxy.ts) can import
// isAdminRole without pulling in helpers.tsx's React/JSX exports.
export const ROLES = {
	student: "STUDENT",
	staff: "STAFF",
	admin: "ADMIN",
} as const satisfies Record<string, Role>;

export function isAdminRole(role?: string | null): boolean {
	return role === ROLES.admin;
}

export function isStudentRole(role?: string | null): boolean {
	return role === ROLES.student;
}

export function isStaffRole(role?: string | null): boolean {
	return role === ROLES.staff;
}

import { prisma } from "@/database";
import { Prisma } from "@prisma/client";
import { normalizeSemesterCode } from "@/components/domain/filters/semester-filter";

// Sortable key from a semester's own code (SP/FA + year) - two "slots" per
// year, Spring before Fall, so e.g. FA26 sorts just after SP26. Doesn't
// depend on any Thursday existing under the semester yet, unlike sorting by
// first-Thursday-date (below) - a freshly created semester has none, and
// used to always sort first regardless of what year/season it represents.
// Unparseable names sort last.
function getSemesterSortKey(name: string): number {
	const code = normalizeSemesterCode(name);
	if (!code) return -Infinity;

	const season = code.slice(0, 2);
	const year = Number(code.slice(2));
	return year * 2 + (season === "FA" ? 1 : 0);
}

// Fetch all semesters with their thursdays and associated users
export async function getAllSemesters() {
	try {
		const semesters = await prisma.semester.findMany({
			select: {
				id: true,
				name: true,
				thursdays: { 
					orderBy: { date: "asc" },
					select: {
						id: true,
						date: true,
						productions: { select: { id: true } }
					} 
				}, 
				users: {
					select: { id: true, name: true, image: true }
				}
			},
		});

		// Sort by the semester's own code (SP/FA + year), newest first.
		semesters.sort((a, b) => getSemesterSortKey(b.name) - getSemesterSortKey(a.name));

		return semesters;
	} catch (error) {
		console.error("Database Error:", error);
		throw new Error("Failed to fetch Semesters.");
	}
}

// Generate all Thursday dates within a given range
export async function generateSemesterThursdays(dateRange: [string, string] | (string | Date)[]) {
	if (!Array.isArray(dateRange) || dateRange.length !== 2) {
		return [];
	}

	const startDate = new Date(dateRange[0]);
	const endDate = new Date(dateRange[1]);

	if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || startDate > endDate) {
		return [];
	}

	const dates: Date[] = [];
	let current = new Date(startDate);

	while (current <= endDate) {
		if (current.getDay() === 4) {
			dates.push(new Date(current));
		}
		current.setDate(current.getDate() + 1);
	}

	return dates;
}

// Determine the name of a Thursday based on its position in the semester
export function getSemesterThursdayName(index: number) {
	return index % 2 === 0 ? "Big Production" : "Small Production";
}

// Format a date into a YYYY-MM-DD string key
export function getDateKey(date: Date | string) {
	return new Date(date).toISOString().split("T")[0];
}

// Get default production configuration for a given production day type
export function getDefaultProductionsForThursday(name: string) {
	if (name === "Big Production" || name === "Big Production Day") {
		return { create: [{ name: "Big Production", location: "Pozen Center" }] };
	}
	return undefined;
}

type ProductionWithDetails = Prisma.ProductionGetPayload<{ include: { presentations: true, producers: true } }>;

// Check if a production matches the default placeholder state
export function isPlaceholderBigProduction(production: ProductionWithDetails) {
	return (
		production.name === "Big Production" &&
		production.location === "Pozen Center" &&
		(production.presentations?.length ?? 0) === 0 &&
		(production.producers?.length ?? 0) === 0
	);
}

type ThursdayWithProductions = Prisma.ThursdayGetPayload<{ include: { productions: { include: { presentations: true, producers: true } } } }>;

// Determine if a Thursday is empty or only contains a placeholder production
export async function isEmptyOrPlaceholderThursday(thursday: ThursdayWithProductions) {
	const productionCount = thursday.productions?.length ?? 0;
	if (productionCount === 0) return true;
	if (productionCount === 1 && (isPlaceholderBigProduction(thursday.productions[0] as ProductionWithDetails))) return true;
	return false;
}

// Calculates the middle timestamp between the first and last Thursday of a semester
export function getMidSemesterTimestamp(thursdays: Array<{ date: Date }>): number | null {
	if (!thursdays || thursdays.length === 0) return null;
	
	const sorted = [...thursdays].sort((a, b) => a.date.getTime() - b.date.getTime());
	
	const startDate = new Date(sorted[0].date);
	const endDate = new Date(sorted[sorted.length - 1].date);
	
	return (startDate.getTime() + endDate.getTime()) / 2;
}

export type ActionResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

// Standard wrapper for Server Actions to provide consistent error handling
export async function action<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
	try {
		const data = await fn();
		return { success: true, data };
	} catch (error: any) {
		// Forward framework-level redirects
		if (error.message === "NEXT_REDIRECT" || (error.digest && typeof error.digest === "string" && error.digest.includes("NEXT_REDIRECT"))) {
			throw error;
		}
		console.error("Action Error:", error);
		return { 
			success: false, 
			error: error instanceof Error ? error.message : "An unexpected error occurred." 
		};
	}
}

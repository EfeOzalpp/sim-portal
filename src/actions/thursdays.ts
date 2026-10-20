"use server";

// React & Next.js
import { revalidatePath, unstable_noStore as noStore } from "next/cache";

// Actions
import { ensureAdmin } from "@/actions/auth";
import { getAllSemesters as getAllSemestersUtil, action } from "@/actions/utilities";
import { ThursdaySchema, ThursdayInput, ProductionSchema, ProductionInput, PresentationInput, FilterSchema } from "@/actions/schemas";

// Helpers
import { prisma } from "@/database";
import { isAllSemestersValue } from "@/constants/filters";
import { getSelectedSemesterId } from "@/components/domain/filters/semester-filter";
import { Prisma } from "@prisma/client";
import { z } from "zod";

export async function getAllSemesters() {
	return await getAllSemestersUtil();
}

export async function getThursday(id: string) {
	return await action(async () => {
		const thursday = await prisma.thursday.findUnique({
			where: { id: id },
			select: {
				id: true,
				name: true,
				date: true,
				semester_id: true,
				semester: { select: { name: true } },
				productions: {
					select: {
						id: true,
						name: true,
						location: true,
						tags: true,
						thursday_id: true,
						producers: { select: { id: true, name: true, image: true, role: true } },
						presentations: {
							select: {
								id: true,
								name: true,
								about: true,
								production_id: true,
								tags: true,
								presenters: { select: { id: true, name: true, image: true, role: true } }
							}
						}
					}
				}
			},
		});
		if (!thursday) throw new Error("Thursday not found");
		return thursday;
	});
}

export async function getAdjacentThursdays(id: string) {
	return await action(async () => {
		const currentThursday = await prisma.thursday.findUnique({
			where: { id },
			select: { date: true, semester_id: true },
		});

		if (!currentThursday || !currentThursday.semester_id) {
			return { previous: null, next: null };
		}

		const previous = await prisma.thursday.findFirst({
			where: {
				semester_id: currentThursday.semester_id,
				date: { lt: currentThursday.date },
			},
			orderBy: { date: "desc" },
			select: { id: true, name: true, date: true },
		});

		const next = await prisma.thursday.findFirst({
			where: {
				semester_id: currentThursday.semester_id,
				date: { gt: currentThursday.date },
			},
			orderBy: { date: "asc" },
			select: { id: true, name: true, date: true },
		});

		return { previous, next };
	});
}

export async function getProductionTagSuggestions() {
	return await action(async () => {
		noStore();

		const productions = await prisma.production.findMany({ select: { tags: true } });
		const hidden = await prisma.hiddenTagSuggestion.findMany({ where: { kind: "production" }, select: { tag: true } });
		const hiddenTags = new Set(hidden.map(({ tag }) => tag));
		const tags = new Set<string>();
		for (const production of productions) {
			for (const tag of production.tags) {
				const normalized = tag.trim();
				if (normalized && !hiddenTags.has(normalized)) tags.add(normalized);
			}
		}
		return Array.from(tags).sort((a, b) => a.localeCompare(b));
	});
}

export async function getPresentationTagSuggestions() {
	return await action(async () => {
		noStore();

		const presentations = await prisma.presentation.findMany({
			select: { tags: true },
		});
		const hidden = await prisma.hiddenTagSuggestion.findMany({ where: { kind: "presentation" }, select: { tag: true } });
		const hiddenTags = new Set(hidden.map(({ tag }) => tag));
		const tags = new Set<string>();

		for (const presentation of presentations) {
			for (const tag of presentation.tags) {
				const normalized = tag.trim();
				if (normalized && !hiddenTags.has(normalized)) tags.add(normalized);
			}
		}

		return Array.from(tags).sort((a, b) => a.localeCompare(b));
	});
}

export async function hideTagSuggestion(kind: TagSuggestionKind, tag: string) {
	return await action(async () => {
		await ensureAdmin();
		const input = z.object({ kind: z.enum(["production", "presentation"]), tag: z.string().trim().min(1) }).parse({ kind, tag });
		await prisma.hiddenTagSuggestion.upsert({
			where: { kind_tag: input },
			create: input,
			update: {},
		});
	});
}

type TagSuggestionKind = "production" | "presentation";

function addedTags(next: string[] | undefined, previous: string[] = []) {
	const existing = new Set(previous.map((tag) => tag.trim()));
	return (next || []).map((tag) => tag.trim()).filter((tag) => tag && !existing.has(tag));
}

async function unhideTagSuggestions(tx: Prisma.TransactionClient, kind: TagSuggestionKind, tags: string[]) {
	if (tags.length === 0) return;
	await tx.hiddenTagSuggestion.deleteMany({ where: { kind, tag: { in: Array.from(new Set(tags)) } } });
}

export async function getFilteredThursdays(rawFilters: { semester?: string | string[]; semesterId?: string | string[]; thursdays?: string | string[] }) {
	return await action(async () => {
		noStore();

		const validation = FilterSchema.safeParse(rawFilters);
		const validatedFilters = validation.success ? validation.data : {};

		const filters = {
			semesterId: Array.isArray(validatedFilters.semesterId) ? validatedFilters.semesterId[0] : validatedFilters.semesterId,
			semester: Array.isArray(validatedFilters.semester) ? validatedFilters.semester[0] : validatedFilters.semester,
			thursdays: Array.isArray(validatedFilters.thursdays) ? validatedFilters.thursdays[0] : validatedFilters.thursdays,
		};

		let semesterQuery: Prisma.ThursdayWhereInput = {};

		if (filters.semesterId && !isAllSemestersValue(filters.semesterId)) {
			semesterQuery = { semester: { id: filters.semesterId } };
		} else if (filters.semester && !isAllSemestersValue(filters.semester)) {
			// Fallback for legacy name-based filtering
			semesterQuery = { semester: { name: { contains: filters.semester } } };
		} else if (!filters.semesterId && !filters.semester) {
			// No explicit filter in the URL yet - default to whatever the
			// page's own filter Select shows as pre-selected (the semester
			// matching today's date, falling back to the newest one), not just
			// "the newest semester" outright. Those can differ - e.g. a future
			// semester already exists but has no members yet - and blindly
			// querying the newest one made a fresh page load show "no
			// results" even though the visible filter looked normal.
			const semesters = await getAllSemestersUtil();
			const defaultSemesterId = getSelectedSemesterId(rawFilters, semesters);
			if (defaultSemesterId && !isAllSemestersValue(defaultSemesterId)) {
				semesterQuery = { semester: { id: defaultSemesterId } };
			}
		}

		const search = filters.thursdays || "";

		return await prisma.thursday.findMany({
			where: {
				OR: [
					{ name: { contains: search, mode: "insensitive" } },
					{ productions: { some: { name: { contains: search, mode: "insensitive" } } } },
					{ productions: { some: { location: { contains: search, mode: "insensitive" } } } },
				],
				AND: semesterQuery,
			},
			orderBy: {
				date: "asc",
			},
			select: {
				id: true,
				name: true,
				date: true,
				semester_id: true,
				productions: {
					select: {
						id: true,
						name: true,
						location: true,
						tags: true,
						thursday_id: true,
						producers: { select: { id: true, name: true, image: true, role: true } },
						presentations: {
							select: {
								id: true,
								name: true,
								about: true,
								production_id: true,
								tags: true,
								presenters: { select: { id: true, name: true, image: true, role: true } }
							}
						}
					},
				},
			},
		});
	});
}

export async function editThursday(data: ThursdayInput & { productions?: string[], semester?: string }) {
	return await action(async () => {
		await ensureAdmin();

		const validation = ThursdaySchema.safeParse(data);
		if (!validation.success) {
			throw new Error(validation.error.issues[0].message);
		}
		const validatedFields = validation.data;

		await prisma.thursday.update({
			where: { id: validatedFields.id! },
			data: {
				name: validatedFields.name,
				date: new Date(validatedFields.date),
				productions: (data.productions) ? { set: data.productions.map((id) => ({ id })) } : undefined,
				semester: (data.semester || validatedFields.semester_id) ? { connect: { id: data.semester || validatedFields.semester_id } } : undefined,
			},
		});

		revalidatePath("/thursdays");
		revalidatePath(`/thursdays/${validatedFields.id}`);
		return { success: true };
	});
}

export async function updateThursdayWithProductions(data: ThursdayInput & { semesterId?: string, productions: ProductionInput[] }) {
	return await action(async () => {
		await ensureAdmin();

		const validation = ThursdaySchema.safeParse(data);
		if (!validation.success) {
			throw new Error(validation.error.issues[0].message);
		}
		const validatedFields = validation.data;

		const productionsValidation = z.array(ProductionSchema).safeParse(data.productions);
		if (!productionsValidation.success) {
			throw new Error(productionsValidation.error.issues[0].message);
		}
		const validatedProductions = productionsValidation.data;

		return await prisma.$transaction(async (tx) => {
			await tx.thursday.update({
				where: { id: validatedFields.id! },
				data: {
					name: validatedFields.name,
					date: new Date(validatedFields.date),
					semester: (data.semesterId || validatedFields.semester_id) ? { connect: { id: data.semesterId || validatedFields.semester_id } } : undefined,
				},
			});

			const existingProductions = await tx.production.findMany({
				where: { thursday_id: validatedFields.id! },
				select: { id: true, tags: true, presentations: { select: { id: true, tags: true } } },
			});
			const existingProductionIds = existingProductions.map((p) => p.id);
			const previousProductionTags = new Map(existingProductions.map((p) => [p.id, p.tags]));
			const previousPresentationTags = new Map(existingProductions.flatMap((p) => p.presentations.map((pres) => [pres.id, pres.tags] as const)));
			const addedProductionTags: string[] = [];
			const addedPresentationTags: string[] = [];

			const currentProductionIds = validatedProductions.map((p) => p.id).filter((id): id is string => !!id);

			// Delete productions no longer in the list
			const productionsToDelete = existingProductionIds.filter((id) => !currentProductionIds.includes(id));
			for (const id of productionsToDelete) {
				// Transactional deletion
				await tx.presentation.deleteMany({ where: { production_id: id } });
				await tx.production.delete({ where: { id } });
			}

			// Handle new and existing productions
			for (const p of validatedProductions) {
				// id/thursday_id/producers/presentations all need relation-aware
				// handling below - only the plain scalars (name, location, and any
				// future field added to ProductionSchema) ride along via the spread.
				const { id: _pId, thursday_id: _tId, producers, presentations, ...productionScalars } = p;
				addedProductionTags.push(...addedTags(p.tags, p.id ? previousProductionTags.get(p.id) : undefined));
				for (const pres of presentations || []) {
					addedPresentationTags.push(...addedTags(pres.tags, pres.id ? previousPresentationTags.get(pres.id) : undefined));
				}

				if (!p.id) {
					await tx.production.create({
						data: {
							...productionScalars,
							thursday: { connect: { id: validatedFields.id! } },
							producers: {
								connect: (producers || []).map((id: string) => ({ id })),
							},
							presentations: {
								create: (presentations || []).map((pres) => {
									const { id: _presId, production_id: _prodId, presenters, ...presentationScalars } = pres;
									return {
										...presentationScalars,
										presenters: {
											connect: (presenters || []).map((id: string) => ({ id })),
										},
									};
								}),
							},
						},
					});
				} else {
					await tx.production.update({
						where: { id: p.id },
						data: {
							...productionScalars,
							producers: { set: (producers || []).map((id: string) => ({ id })) },
						}
					});

					const currentPresentationIds = (presentations || []).map((pres) => pres.id).filter((id): id is string => !!id);

					// Delete presentations
					await tx.presentation.deleteMany({
						where: {
							production_id: p.id,
							id: { notIn: currentPresentationIds }
						}
					});

					for (const pres of (presentations || [])) {
						const { id: _presId, production_id: _prodId, presenters, ...presentationScalars } = pres;

						if (!pres.id) {
							await tx.presentation.create({
								data: {
									...presentationScalars,
									production: { connect: { id: p.id } },
									presenters: { connect: (presenters || []).map((id: string) => ({ id })) }
								}
							});
						} else {
							await tx.presentation.update({
								where: { id: pres.id },
								data: {
									...presentationScalars,
									presenters: { set: (presenters || []).map((id: string) => ({ id })) }
								}
							});
						}
					}
				}
			}

			await unhideTagSuggestions(tx, "production", addedProductionTags);
			await unhideTagSuggestions(tx, "presentation", addedPresentationTags);

			revalidatePath("/thursdays");
			revalidatePath(`/thursdays/${validatedFields.id}`);
			return { success: true };
		});
	});
}

export async function createThursdayWithProductions(data: ThursdayInput & { semesterId?: string, productions: ProductionInput[] }) {
	return await action(async () => {
		await ensureAdmin();

		const validation = ThursdaySchema.safeParse(data);
		if (!validation.success) {
			throw new Error(validation.error.issues[0].message);
		}
		const validatedFields = validation.data;

		const productionsValidation = z.array(ProductionSchema).safeParse(data.productions);
		if (!productionsValidation.success) {
			throw new Error(productionsValidation.error.issues[0].message);
		}
		const validatedProductions = productionsValidation.data;

		let semesterId = data.semesterId || validatedFields.semester_id;
		if (!semesterId) {
			// Prefer whichever semester actually matches today over
			// semesters[0] (newest by code) - production keeps future
			// semesters pre-created for planning ahead, and those would
			// otherwise always outrank the real current one as "newest".
			const semesters = await getAllSemestersUtil();
			// No filter value passed in, so this can only resolve to a real
			// semester id or null - never the "all semesters" sentinel.
			semesterId = getSelectedSemesterId({}, semesters) ?? undefined;
		}

		return await prisma.$transaction(async (tx) => {
			const thursday = await tx.thursday.create({
				data: {
					name: validatedFields.name,
					date: new Date(validatedFields.date),
					semester: semesterId ? { connect: { id: semesterId } } : undefined,
				},
			});

			for (const p of validatedProductions) {
				const { id: _pId, thursday_id: _tId, producers, presentations, ...productionScalars } = p;

				await tx.production.create({
					data: {
						...productionScalars,
						thursday: { connect: { id: thursday.id } },
						producers: {
							connect: (producers || []).map((id: string) => ({ id })),
						},
						presentations: {
							create: (presentations || []).map((pres) => {
								const { id: _presId, production_id: _prodId, presenters, ...presentationScalars } = pres;
								return {
									...presentationScalars,
									presenters: {
										connect: (presenters || []).map((id: string) => ({ id })),
									},
								};
							}),
						},
					},
				});
			}

			await unhideTagSuggestions(tx, "production", validatedProductions.flatMap((p) => addedTags(p.tags)));
			await unhideTagSuggestions(tx, "presentation", validatedProductions.flatMap((p) => (p.presentations || []).flatMap((pres) => addedTags(pres.tags))));

			revalidatePath("/thursdays");
			return thursday;
		});
	});
}

export async function removeThursday(data: { id: string }) {
	return await action(async () => {
		await ensureAdmin();

		await prisma.thursday.delete({
			where: { id: data.id },
		});

		revalidatePath("/thursdays");
		return { success: true };
	});
}

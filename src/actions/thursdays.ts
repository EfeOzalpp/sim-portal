"use server";

import { revalidatePath, unstable_noStore as noStore } from "next/cache";

import { prisma } from "@/database";

import { ensureAdmin } from "@/actions/auth";
import { getAllSemesters as getAllSemestersUtil, action } from "@/actions/utilities";
import { ThursdaySchema, ThursdayInput, ProductionInput, PresentationInput, FilterSchema } from "@/actions/schemas";
import { Prisma } from "@prisma/client";

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
						thursday_id: true,
						producers: { select: { id: true, name: true, image: true, role: true } },
						presentations: {
							select: {
								id: true,
								name: true,
								about: true,
								production_id: true,
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

		if (filters.semesterId && filters.semesterId !== "All") {
			semesterQuery = { semester: { id: filters.semesterId } };
		} else if (filters.semester && filters.semester !== "All") {
			// Fallback for legacy name-based filtering
			semesterQuery = { semester: { name: { contains: filters.semester } } };
		} else if (!filters.semesterId && !filters.semester) {
			// Default to first semester if no filter provided
			const semesters = await getAllSemestersUtil();
			if (semesters.length > 0) {
				semesterQuery = { semester: { id: semesters[0].id } };
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
						thursday_id: true,
						producers: { select: { id: true, name: true, image: true, role: true } },
						presentations: {
							select: {
								id: true,
								name: true,
								about: true,
								production_id: true,
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
				select: { id: true },
			});
			const existingProductionIds = existingProductions.map((p) => p.id);

			const currentProductionIds = data.productions.map((p) => p.id).filter((id): id is string => !!id);

			// Delete productions no longer in the list
			const productionsToDelete = existingProductionIds.filter((id) => !currentProductionIds.includes(id));
			for (const id of productionsToDelete) {
				// Transactional deletion
				await tx.presentation.deleteMany({ where: { production_id: id } });
				await tx.production.delete({ where: { id } });
			}

			// Handle new and existing productions
			for (const p of data.productions) {
				if (!p.id) {
					await tx.production.create({
						data: {
							name: p.name,
							location: p.location,
							thursday: { connect: { id: validatedFields.id! } },
							producers: {
								connect: (p.producers || []).map((id: string) => ({ id })),
							},
							presentations: {
								create: (p.presentations || []).map((pres) => ({
									name: pres.name,
									about: pres.about || "",
									presenters: {
										connect: (pres.presenters || []).map((id: string) => ({ id })),
									},
								})),
							},
						},
					});
				} else {
					await tx.production.update({
						where: { id: p.id },
						data: {
							name: p.name,
							location: p.location,
							producers: { set: (p.producers || []).map((id: string) => ({ id })) },
						}
					});
					
					const currentPresentationIds = (p.presentations || []).map((pres) => pres.id).filter((id): id is string => !!id);
					
					// Delete presentations
					await tx.presentation.deleteMany({
						where: { 
							production_id: p.id,
							id: { notIn: currentPresentationIds }
						}
					});
					
					for (const pres of (p.presentations || [])) {
						if (!pres.id) {
							await tx.presentation.create({
								data: {
									name: pres.name,
									about: pres.about || "",
									production: { connect: { id: p.id } },
									presenters: { connect: (pres.presenters || []).map((id: string) => ({ id })) }
								}
							});
						} else {
							await tx.presentation.update({
								where: { id: pres.id },
								data: {
									name: pres.name,
									presenters: { set: (pres.presenters || []).map((id: string) => ({ id })) }
								}
							});
						}
					}
				}
			}

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

		let semesterId = data.semesterId || validatedFields.semester_id;
		if (!semesterId) {
			const semesters = await getAllSemestersUtil();
			semesterId = semesters[0]?.id;
		}

		return await prisma.$transaction(async (tx) => {
			const thursday = await tx.thursday.create({
				data: {
					name: validatedFields.name,
					date: new Date(validatedFields.date),
					semester: semesterId ? { connect: { id: semesterId } } : undefined,
				},
			});

			for (const p of data.productions) {
				await tx.production.create({
					data: {
						name: p.name,
						location: p.location,
						thursday: { connect: { id: thursday.id } },
						producers: {
							connect: (p.producers || []).map((id: string) => ({ id })),
						},
						presentations: {
							create: (p.presentations || []).map((pres) => ({
								name: pres.name,
								about: pres.about || "",
								presenters: {
									connect: (pres.presenters || []).map((id: string) => ({ id })),
								},
							})),
						},
					},
				});
			}

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

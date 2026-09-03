"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/database";

import { ensureAdmin } from "@/actions/auth";
import { action } from "@/actions/utilities";
import { ProductionSchema, ProductionInput } from "@/actions/schemas";

// Fetch a single production with its producers and presentations
export async function getProduction(id: string) {
	return await action(async () => {
		const production = await prisma.production.findUnique({
			where: { id: id },
			include: { 
				producers: { select: { id: true, name: true, image: true, role: true } }, 
				presentations: { 
					include: { 
						presenters: { select: { id: true, name: true, image: true, role: true } } 
					} 
				}, 
				thursday: true 
			},
		});
		if (!production) throw new Error("Production not found");
		return production;
	});
}

// Fetch all productions and format them for display in a list
export async function getAllProductions() {
	return await action(async () => {
		const productions = await prisma.production.findMany({
			select: {
				id: true,
				name: true,
				location: true,
				producers: { select: { id: true, name: true } },
			},
			orderBy: { name: "asc" }
		});

		return productions.map((production, index) => ({
			...production,
			key: index
		}));
	});
}

// Create a new production and its associated presentations
export async function addProduction(data: ProductionInput & { producers?: string[], thursday?: string, presentations?: any[] }) {
	return await action(async () => {
		await ensureAdmin();

		const validation = ProductionSchema.safeParse(data);
		if (!validation.success) {
			throw new Error(validation.error.issues[0].message);
		}
		const validatedFields = validation.data;

		return await prisma.$transaction(async (tx) => {
			const production = await tx.production.create({
				data: {
					name: validatedFields.name,
					location: validatedFields.location,
					producers: {
						connect: (data.producers || validatedFields.producers || []).map((id) => ({ id })),
					},
					thursday: {
						connect: { id: data.thursday || validatedFields.thursday_id! },
					},
				},
			});

			for (const p of (data.presentations || validatedFields.presentations || [])) {
				await tx.presentation.create({
					data: {
						name: p.name,
						about: p.about || "",
						production: { connect: { id: production.id } },
						presenters: {
							connect: (p.presenters || []).map((id: string) => ({ id })),
						},
					},
				});
			}

			revalidatePath("/thursdays");
			revalidatePath(`/thursdays/${data.thursday || validatedFields.thursday_id}`);
			return production;
		});
	});
}

// Update an existing production and manage its presentations (add/update/delete)
export async function editProduction(data: ProductionInput & { producers?: string[], thursday?: string, presentations?: any[] }) {
	return await action(async () => {
		await ensureAdmin();

		const validation = ProductionSchema.safeParse(data);
		if (!validation.success) {
			throw new Error(validation.error.issues[0].message);
		}
		const validatedFields = validation.data;

		return await prisma.$transaction(async (tx) => {
			await tx.production.update({
				where: { id: validatedFields.id! },
				data: {
					name: validatedFields.name,
					location: validatedFields.location,
					producers: { set: (data.producers || validatedFields.producers || []).map((id) => ({ id })) },
					thursday: { connect: { id: data.thursday || validatedFields.thursday_id! } },
				},
			});

			const currentPresentations = (data.presentations || validatedFields.presentations || []);
			const currentPresentationIds = currentPresentations.map((p) => p.id).filter((id): id is string => Boolean(id));

			// Remove presentations that are no longer part of the production
			await tx.presentation.deleteMany({
				where: {
					production_id: validatedFields.id!,
					id: { notIn: currentPresentationIds }
				}
			});

			// Update existing presentations or create new ones
			for (const p of currentPresentations) {
				if (!p.id) {
					await tx.presentation.create({
						data: {
							name: p.name,
							about: p.about || "",
							production: { connect: { id: validatedFields.id! } },
							presenters: {
								connect: (p.presenters || []).map((id: string) => ({ id })),
							},
						},
					});
				} else {
					await tx.presentation.update({
						where: { id: p.id },
						data: {
							name: p.name,
							about: p.about || "",
							presenters: {
								set: (p.presenters || []).map((id: string) => ({ id })),
							},
						},
					});
				}
			}

			revalidatePath("/thursdays");
			revalidatePath(`/thursdays/${data.thursday || validatedFields.thursday_id}`);
			return { success: true };
		});
	});
}

// Optimized helper for updating production presentations within a larger transaction or standalone
export async function updateProductionPresentations(productionData: ProductionInput & { producers?: string[], presentations?: any[] }) {
	return await action(async () => {
		await ensureAdmin();

		const validation = ProductionSchema.safeParse(productionData);
		if (!validation.success) {
			throw new Error(validation.error.issues[0].message);
		}
		const validatedFields = validation.data;

		return await prisma.$transaction(async (tx) => {
			await tx.production.update({
				where: { id: validatedFields.id! },
				data: {
					name: validatedFields.name,
					location: validatedFields.location,
					producers: { set: (productionData.producers || validatedFields.producers || []).map((id) => ({ id })) },
				},
			});

			const currentPresentations = (productionData.presentations || validatedFields.presentations || []);
			const currentPresentationIds = currentPresentations.map((p) => p.id).filter((id): id is string => Boolean(id));

			// Delete
			await tx.presentation.deleteMany({
				where: {
					production_id: validatedFields.id!,
					id: { notIn: currentPresentationIds }
				}
			});

			// Update / Create
			for (const p of currentPresentations) {
				if (!p.id) {
					await tx.presentation.create({
						data: {
							name: p.name,
							about: "",
							production: { connect: { id: validatedFields.id! } },
							presenters: {
								connect: (p.presenters || []).map((id: string) => ({ id })),
							},
						},
					});
				} else {
					await tx.presentation.update({
						where: { id: p.id },
						data: {
							name: p.name,
							presenters: {
								set: (p.presenters || []).map((id: string) => ({ id })),
							},
						},
					});
				}
			}
			return { success: true };
		});
	});
}

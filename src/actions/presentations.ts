"use server";

import { revalidatePath, unstable_noStore as noStore } from "next/cache";

import { prisma } from "@/database";

import { ensureAdmin } from "@/actions/auth";
import { getAllSemesters as getAllSemestersUtil, action } from "@/actions/utilities";
import { PresentationSchema, PresentationInput } from "@/actions/schemas";

export async function getAllSemesters() {
	return await getAllSemestersUtil();
}

export async function getPresentation(id: string) {
	return await action(async () => {
		const presentation = await prisma.presentation.findUnique({
			where: { id: id },
			include: { 
				production: true, 
				presenters: { select: { id: true, name: true, image: true } } 
			},
		});
		if (!presentation) throw new Error("Presentation not found");
		return presentation;
	});
}

export async function getAllPresentations() {
	return await action(async () => {
		return await prisma.presentation.findMany({
			select: {
				id: true,
				name: true,
				presenters: { select: { id: true, name: true } },
				production: { select: { id: true, name: true, thursday: { select: { date: true } } } },
			},
			orderBy: { name: "asc" }
		});
	});
}

export interface PresentationFilters {
	semester?: string;
	query?: string;
}

export async function getFilteredPresentations(filters: PresentationFilters) {
	return await action(async () => {
		noStore();

		let defaultSemester: any = { production: { thursday: { semester: { name: { contains: "" } } } } };

		if (filters.semester === undefined) {
			const semesters = await getAllSemestersUtil();
			if (semesters.length > 0) {
				defaultSemester = { production: { thursday: { semester: { id: semesters[0].id } } } };
			}
		} else if (filters.semester !== "All") {
			defaultSemester = { production: { thursday: { semester: { name: { contains: filters.semester } } } } };
		}

		const search = filters.query || "";

		return await prisma.presentation.findMany({
			where: {
				OR: [{ name: { contains: search, mode: "insensitive" } }],
				AND: defaultSemester,
			},
			orderBy: {
				name: "asc",
			},
			select: {
				id: true,
				name: true,
				presenters: { select: { id: true, name: true, image: true } },
				production: { select: { id: true, name: true, thursday: { select: { date: true } } } },
			},
		});
	});
}

export async function editPresentation(data: PresentationInput & { users?: string[], production?: string }) {
	return await action(async () => {
		await ensureAdmin();

		const validation = PresentationSchema.safeParse(data);
		if (!validation.success) {
			throw new Error(validation.error.issues[0].message);
		}
		const validatedFields = validation.data;

		await prisma.presentation.update({
			where: { id: validatedFields.id! },
			data: {
				name: validatedFields.name,
				about: validatedFields.about || "",
				presenters: { set: (data.users || validatedFields.presenters || []).map((id) => ({ id })) },
				production: (data.production || validatedFields.production_id) ? { connect: { id: data.production || validatedFields.production_id } } : undefined,
			},
		});

		revalidatePath("/thursdays");
		if (data.production || validatedFields.production_id) {
			revalidatePath(`/thursdays/${data.production || validatedFields.production_id}`);
		}
		return { success: true };
	});
}

export async function addPresentation(data: PresentationInput & { presenters?: string[], production?: string }) {
	return await action(async () => {
		await ensureAdmin();

		const validation = PresentationSchema.safeParse(data);
		if (!validation.success) {
			throw new Error(validation.error.issues[0].message);
		}
		const validatedFields = validation.data;

		const presentation = await prisma.presentation.create({
			data: {
				name: validatedFields.name,
				about: validatedFields.about || "",
				presenters: {
					connect: (data.presenters || validatedFields.presenters || []).map((id) => ({ id })),
				},
				production: {
					connect: { id: data.production || validatedFields.production_id! },
				},
			},
		});
		revalidatePath(`/thursdays/${data.production || validatedFields.production_id}`);
		return presentation;
	});
}

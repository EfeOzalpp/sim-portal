"use server";

import { revalidatePath, unstable_noStore as noStore } from "next/cache";

import { prisma } from "@/database";

import { ensureAdmin, getAuthSession } from "@/actions/auth";
import {
	getAllSemesters as getAllSemestersUtil,
	generateSemesterThursdays,
	getDefaultProductionsForThursday,
	getSemesterThursdayName,
	action,
} from "@/actions/utilities";
import { UserSchema, UserInput, FilterSchema, FilterInputValues } from "@/components/forms/schemas";
import { serializeUserLinks } from "@/components/forms/user/user-links";
import { deleteStoredUserImage, storeUserImage } from "@/actions/user-image-storage";
import { Prisma } from "@prisma/client";

function normalizeSemesterCode(value?: string | null) {
	if (!value) return null;

	const code = value.match(/^(SP|FA)\d{2}$/i);
	if (code) return value.toUpperCase();

	const namedSemester = value.match(/^(Spring|Fall)\s+(\d{4})$/i);
	if (namedSemester) {
		const term = namedSemester[1].toLowerCase() === "spring" ? "SP" : "FA";
		return `${term}${namedSemester[2].slice(-2)}`;
	}

	return null;
}

function isAllFilter(value?: string) {
	return value === "All" || value === "__all__";
}

function getSemesterYear(code: string) {
	return 2000 + Number(code.slice(2));
}

function getSemesterLegacyName(code: string) {
	const year = getSemesterYear(code);
	return code.startsWith("SP") ? `Spring ${year}` : `Fall ${year}`;
}

function getDefaultSemesterDateRange(code: string): [Date, Date] {
	const year = getSemesterYear(code);

	if (code.startsWith("SP")) {
		return [new Date(year, 0, 15), new Date(year, 4, 15)];
	}

	return [new Date(year, 8, 1), new Date(year, 11, 20)];
}

async function findOrCreateSemesterForCode(tx: Prisma.TransactionClient, code: string) {
	const existingSemester = await tx.semester.findFirst({
		where: {
			name: {
				in: [code, getSemesterLegacyName(code)],
			},
		},
		select: { id: true },
	});

	if (existingSemester) return existingSemester;

	const dates = await generateSemesterThursdays(getDefaultSemesterDateRange(code));
	const thursdays = dates.map((day, index) => {
		const name = getSemesterThursdayName(index);
		const defaultProductions = getDefaultProductionsForThursday(name);

		return {
			name,
			date: day,
			...(defaultProductions ? { productions: defaultProductions } : {}),
		};
	});

	return await tx.semester.create({
		data: {
			name: code,
			thursdays: {
				create: thursdays,
			},
		},
		select: { id: true },
	});
}

async function getSemesterIdsForUserInput(
	tx: Prisma.TransactionClient,
	semesterCodes: string[] | undefined,
	semesterIds: string[] | undefined,
) {
	if (semesterCodes) {
		const codes = [...new Set(semesterCodes.map(normalizeSemesterCode).filter(Boolean) as string[])];
		const semesters = await Promise.all(codes.map((code) => findOrCreateSemesterForCode(tx, code)));
		return semesters.map((semester) => semester.id);
	}

	return semesterIds ?? [];
}

export async function getAllSemesters() {
	return await getAllSemestersUtil();
}

export async function getUser(id: string) {
	return await action(async () => {
		const user = await prisma.user.findUnique({
			where: { id: id },
			select: {
				id: true,
				name: true,
				email: true,
				image: true,
				pronouns: true,
				link: true,
				about: true,
				role: true,
				semesters: {
					select: { id: true, name: true }
				},
				presentations: { 
					include: { 
						presenters: {
							select: {
								id: true,
								name: true,
							}
						},
						production: {
							select: {
								thursday_id: true,
							}
						}
					} 
				},
				// Exclude productions as they aren't used in the main profile view currently
			}
		});
		if (!user) throw new Error("User not found");
		return user;
	});
}

export async function getAllUsers() {
	return await action(async () => {
		return await prisma.user.findMany({
			where: { role: { not: "STAFF" } },
			select: {
				id: true,
				name: true,
				email: true,
				image: true,
				role: true,
			},
			orderBy: { name: "asc" }
		});
	});
}

export async function getFilteredUsers(rawFilters: any) {
	return await action(async () => {
		noStore();

		const validation = FilterSchema.safeParse(rawFilters);
		const validatedFilters = validation.success ? validation.data : {};

		const filters = {
			semesterId: Array.isArray(validatedFilters.semesterId) ? validatedFilters.semesterId[0] : validatedFilters.semesterId,
			user: Array.isArray(validatedFilters.user) ? validatedFilters.user[0] : validatedFilters.user,
			semester: Array.isArray(validatedFilters.semester) ? validatedFilters.semester[0] : validatedFilters.semester,
		};

		let semesterQuery: Prisma.UserWhereInput = {};

		if (filters.semesterId && !isAllFilter(filters.semesterId)) {
			semesterQuery = { semesters: { some: { id: filters.semesterId } } };
		} else if (filters.semester && !isAllFilter(filters.semester)) {
			// Fallback for legacy name-based filtering
			semesterQuery = { semesters: { some: { name: { contains: filters.semester } } } };
		} else if (!filters.semesterId && !filters.semester) {
			// Default to first semester if no filter provided
			const semesters = await getAllSemestersUtil();
			if (semesters.length > 0) {
				semesterQuery = { semesters: { some: { id: semesters[0].id } } };
			}
		}

		const userSearch = filters.user || "";

		return await prisma.user.findMany({
			where: {
				OR: [{ name: { contains: userSearch, mode: "insensitive" } }],
				AND: semesterQuery,
			},
			orderBy: {
				name: "asc",
			},
			select: {
				id: true,
				name: true,
				image: true,
				role: true,
			},
		});
	});
}

export async function editUser(formData: UserInput) {
	return await action(async () => {
		const validation = UserSchema.safeParse(formData);
		if (!validation.success) {
			throw new Error(validation.error.issues[0].message);
		}
		const validatedFields = validation.data;
		const { id, name, about, image, email, link, links, pronouns, role, semesterIds, semesterCodes } = validatedFields;
		const hasSemesterCodes = Array.isArray((formData as any).semesterCodes);
		const serializedLinks = serializeUserLinks(links?.length ? links : link);
		
		const { user: currentUser, isAdmin } = await getAuthSession();
		
		// Permission check: Admin or user editing themselves
		if (!isAdmin && currentUser?.id !== id) {
			throw new Error("Unauthorized: You can only edit your own profile.");
		}

		try {
			const previousUser = await prisma.user.findUnique({
				where: { id: id! },
				select: { image: true },
			});

			const updatedUser = await prisma.$transaction(async (tx) => {
				// Only admins can change admin status or semesters
				const data: Prisma.UserUpdateInput = { name, about, image, link: serializedLinks, pronouns, email };
				if (isAdmin) {
					const resolvedSemesterIds = await getSemesterIdsForUserInput(
						tx,
						hasSemesterCodes ? semesterCodes : undefined,
						semesterIds,
					);

					data.role = role;
					data.semesters = {
						set: resolvedSemesterIds.map((id) => ({ id })),
					};
				}

				return await tx.user.update({
					where: { id: id! },
					data,
				});
			});

			// Now that the new image path is safely committed, clean up the
			// old file — but only if no other user row still points at it.
			// Storage is content-addressed (filename = hash of the bytes), so
			// two users can legitimately share one file if they uploaded the
			// same image.
			if (previousUser?.image && previousUser.image !== updatedUser.image) {
				const stillReferenced = await prisma.user.count({ where: { image: previousUser.image } });
				if (stillReferenced === 0) {
					await deleteStoredUserImage(previousUser.image).catch((error) => {
						console.error(`Failed to delete orphaned user image "${previousUser.image}":`, error);
					});
				}
			}

			revalidatePath("/users");
			revalidatePath("/individual");
			revalidatePath("/semester");
			revalidatePath("/thursdays");
			return updatedUser;
		} catch (error: any) {
			if (error instanceof Error && (error as any).code === "P2002") {
				throw new Error("A user with this email already exists.");
			}
			throw error;
		}
	});
}

export async function addUser(formData: UserInput) {
	return await action(async () => {
		await ensureAdmin();

		const validation = UserSchema.safeParse(formData);
		if (!validation.success) {
			throw new Error(validation.error.issues[0].message);
		}
		const validatedFields = validation.data;
		const { semesterIds, semesterCodes, links, link, ...userData } = validatedFields;
		const hasSemesterCodes = Array.isArray((formData as any).semesterCodes);
		const serializedLinks = serializeUserLinks(links?.length ? links : link);

		try {
			const newUser = await prisma.$transaction(async (tx) => {
				const resolvedSemesterIds = await getSemesterIdsForUserInput(
					tx,
					hasSemesterCodes ? semesterCodes : undefined,
					semesterIds,
				);

				return await tx.user.create({
					data: {
						...userData,
						link: serializedLinks,
						semesters: {
							connect: resolvedSemesterIds.map((id) => ({ id })),
						},
					},
				});
			});
			revalidatePath("/individual");
			revalidatePath("/users");
			revalidatePath("/semester");
			revalidatePath("/thursdays");
			return newUser;
		} catch (error: any) {
			if (error instanceof Error && (error as any).code === "P2002") {
				throw new Error("A user with this email already exists.");
			}
			throw error;
		}
	});
}

export async function removeUser(user: any) {
	return await action(async () => {
		await ensureAdmin();

		const deletedUser = await prisma.user.delete({
			where: { id: user.id },
		});

		// Same orphan risk as a re-upload: clean up the departing user's
		// image, but only if no other row still points at that same
		// content-addressed file.
		if (deletedUser.image) {
			const stillReferenced = await prisma.user.count({ where: { image: deletedUser.image } });
			if (stillReferenced === 0) {
				await deleteStoredUserImage(deletedUser.image).catch((error: unknown) => {
					console.error(`Failed to delete orphaned user image "${deletedUser.image}":`, error);
				});
			}
		}

		revalidatePath("/individual");
		revalidatePath("/users");
		return { success: true };
	});
}

export async function handleImageUpload(file: File) {
	await ensureAdmin();
	const { publicPath } = await storeUserImage(file);
	return publicPath;
}

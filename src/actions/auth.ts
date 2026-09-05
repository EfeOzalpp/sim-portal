"use server";

import { auth, signIn, signOut } from "@/authentication";
import { prisma } from "@/database";
import { isAdminRole } from "@/constants/roles";

export async function logIn() {
	await signIn("google");
}

export async function logOut() {
	await signOut();
}

export async function getAuthSession() {
	const session = await auth();
	return {
		session,
		user: session?.user ?? null,
		isAdmin: isAdminRole(session?.user?.role)
	};
}

export async function getCurrentUser() {
	const { user } = await getAuthSession();
	if (!user?.email) return null;

	return await prisma.user.findUnique({
		where: { email: user.email },
	});
}

export async function isCurrentUserAdmin() {
	const { isAdmin } = await getAuthSession();
	return isAdmin;
}

export async function ensureAdmin() {
	const { isAdmin } = await getAuthSession();
	if (!isAdmin) {
		throw new Error("Unauthorized: Admin access required.");
	}
}

import { notFound, redirect } from "next/navigation";

import { auth } from "@/authentication";
import {
	editUser,
	getAllSemesters,
	getUser,
	handleImageUpload,
	removeUser,
} from "@/actions/users";
import { getCurrentUser } from "@/actions/auth";
import UserForm from "@/app/users/composition/UserForm";

interface EditUserFormContentProps {
	userId: string;
	showDangerZone?: boolean;
	redirectHref?: string;
}

export default async function EditUserFormContent({
	userId,
	showDangerZone = true,
	redirectHref,
}: EditUserFormContentProps) {
	const result = await getUser(userId);
	if (!result.success) {
		notFound();
	}

	const user = result.data;
	const currentUser = await getCurrentUser();
	if (!currentUser) return null;

	const session = await auth();
	const isAdmin = session?.user?.role === "ADMIN";
	const semesters = await getAllSemesters();

	async function onSubmitEditUser(data: any) {
		"use server";

		let imagePath = data.image;

		if (data.image && typeof data.image === "object" && data.image.size > 0) {
			imagePath = await handleImageUpload(data.image);
			data.image = imagePath;
		}

		const result = await editUser(data);
		if (result.success) {
			redirect(redirectHref || `/users?profileUserId=${result.data.id}`);
		}
		return result;
	}

	async function onSubmitRemoveUser(data: any) {
		"use server";

		const result = await removeUser(data);
		if (result.success) {
			redirect("/");
		}
		return result;
	}

	return (
		<UserForm
			onSubmit={onSubmitEditUser}
			onRemove={showDangerZone ? onSubmitRemoveUser : undefined}
			user={user}
			isCurrentUserAdmin={isAdmin}
			allSemesters={semesters}
		/>
	);
}

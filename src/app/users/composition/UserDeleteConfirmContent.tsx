import { notFound, redirect } from "next/navigation";
import { getAuthSession } from "@/actions/auth";
import { getUser, removeUser } from "@/actions/users";
import ConfirmDelete from "@/components/confirm-delete";

interface UserDeleteConfirmContentProps {
	userId: string;
	returnHref: string;
}

export default async function UserDeleteConfirmContent({
	userId,
	returnHref,
}: UserDeleteConfirmContentProps) {
	const result = await getUser(userId);
	if (!result.success) {
		notFound();
	}

	const { isAdmin } = await getAuthSession();
	if (!isAdmin) return null;

	const user = result.data;

	async function onConfirmDelete() {
		"use server";

		const result = await removeUser({ id: userId });
		if (result.success) {
			redirect(returnHref);
		}
		return result;
	}

	return (
		<ConfirmDelete
			itemName={user.name}
			itemType="user"
			confirmLabel="Delete User"
			errorMessage="An error occurred while deleting the user."
			onConfirm={onConfirmDelete}
		/>
	);
}

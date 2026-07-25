import { notFound, redirect } from "next/navigation";
import { getAuthSession } from "@/actions/auth";
import { getThursday, removeThursday } from "@/actions/thursdays";
import ConfirmDelete from "@/components/modals/ConfirmDelete";
import { normalizeThursdayName } from "@/helpers";

interface ThursdayDeleteConfirmContentProps {
	thursdayId: string;
	returnHref: string;
}

export default async function ThursdayDeleteConfirmContent({
	thursdayId,
	returnHref,
}: ThursdayDeleteConfirmContentProps) {
	const result = await getThursday(thursdayId);
	if (!result.success) {
		notFound();
	}

	const { isAdmin } = await getAuthSession();
	if (!isAdmin) return null;

	const thursdayName = normalizeThursdayName(result.data.name);

	async function onConfirmDelete() {
		"use server";

		const result = await removeThursday({ id: thursdayId });
		if (result.success) {
			redirect(returnHref);
		}
		return result;
	}

	return (
		<ConfirmDelete
			itemName={thursdayName}
			itemType="Thursday"
			confirmLabel="Delete Thursday"
			errorMessage="An error occurred while deleting the Thursday."
			onConfirm={onConfirmDelete}
		/>
	);
}

import { notFound, redirect } from "next/navigation";
import { getAuthSession } from "@/actions/auth";
import { getSemester, removeSemester } from "@/actions/semesters";
import ConfirmDelete from "@/components/modals/ConfirmDelete";

interface SemesterDeleteConfirmContentProps {
	semesterId: string;
	returnHref: string;
}

export default async function SemesterDeleteConfirmContent({
	semesterId,
	returnHref,
}: SemesterDeleteConfirmContentProps) {
	const result = await getSemester(semesterId);
	if (!result.success) {
		notFound();
	}

	const { isAdmin } = await getAuthSession();
	if (!isAdmin) return null;

	async function onConfirmDelete() {
		"use server";

		const result = await removeSemester({ id: semesterId });
		if (result.success) {
			redirect(returnHref);
		}
		return result;
	}

	return (
		<ConfirmDelete
			itemName={result.data.name}
			itemType="semester"
			warningText="This permanently removes the semester and all its associated days, productions, and presentations from the database."
			confirmLabel="Delete Semester"
			errorMessage="An error occurred while deleting the semester."
			onConfirm={onConfirmDelete}
		/>
	);
}

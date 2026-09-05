import { notFound, redirect } from "next/navigation";
import { getAllSemesters } from "@/actions/semesters";
import { getThursday, updateThursdayWithProductions } from "@/actions/thursdays";
import { getAllUsers } from "@/actions/users";
import ThursdayForm from "@/app/thursdays/composition/ThursdayForm";
import { THURSDAY_MODAL_PARAMS } from "@/constants/modal-params";

interface EditThursdayFormContentProps {
	thursdayId: string;
}

export default async function EditThursdayFormContent({
	thursdayId,
}: EditThursdayFormContentProps) {
	const result = await getThursday(thursdayId);

	if (!result.success) {
		notFound();
	}

	const usersResult = await getAllUsers();
	const users = usersResult.success ? usersResult.data : [];
	const semestersResult = await getAllSemesters();
	const semesters = semestersResult.success ? semestersResult.data : [];

	async function onSubmit(data: any) {
		"use server";

		const result = await updateThursdayWithProductions({ ...data, id: thursdayId });
		if (result.success) {
			redirect(`/thursdays?${THURSDAY_MODAL_PARAMS.view}=${thursdayId}`);
		}
		return result;
	}

	return (
		<ThursdayForm
			defaultValues={result.data}
			users={users}
			semesters={semesters}
			thursdayId={thursdayId}
			onSubmit={onSubmit}
		/>
	);
}

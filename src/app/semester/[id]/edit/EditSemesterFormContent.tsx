import { editSemester, getSemester } from "@/actions/semesters";
import { getAllUsers } from "@/actions/users";
import SemesterForm from "@/app/semester/composition/SemesterForm";
import { notFound, redirect } from "next/navigation";

interface EditSemesterFormContentProps {
	semesterId: string;
}

export default async function EditSemesterFormContent({
	semesterId,
}: EditSemesterFormContentProps) {
	const result = await getSemester(semesterId);
	if (!result.success) {
		notFound();
	}

	const semester = {
		...result.data,
		users: result.data.users.map((u) => ({ ...u, name: u.name })),
	};

	const usersResult = await getAllUsers();
	const users = usersResult.success ? usersResult.data.map((u: any) => ({ ...u, name: u.name })) : [];

	async function onSubmitEditSemester(data: any) {
		"use server";

		const result = await editSemester({ ...data, id: semesterId });
		if (result.success) {
			redirect("/semester");
		}
		return result;
	}

	return (
		<SemesterForm
			onSubmit={onSubmitEditSemester}
			semester={semester}
			users={users}
		/>
	);
}

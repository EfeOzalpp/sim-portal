import { redirect } from "next/navigation";
import { addSemester, getAllSemesters } from "@/actions/semesters";
import { getAllUsers } from "@/actions/users";
import SemesterForm from "@/app/semester/composition/SemesterForm";

export default async function AddSemesterFormContent() {
	const semestersResult = await getAllSemesters();
	const semesters = semestersResult.success ? semestersResult.data : [];
	const usersFromCurrentSemester = (semesters[0]?.users || []).map((u: any) => ({ ...u, name: u.name }));

	const usersResult = await getAllUsers();
	const users = usersResult.success ? usersResult.data.map((u: any) => ({ ...u, name: u.name })) : [];

	async function onSubmitAddSemester(data: any) {
		"use server";

		const result = await addSemester(data);
		if (result.success) {
			redirect("/semester");
		}
		return result;
	}

	return (
		<SemesterForm
			onSubmit={onSubmitAddSemester}
			usersFromCurrentSemester={usersFromCurrentSemester}
			users={users}
		/>
	);
}

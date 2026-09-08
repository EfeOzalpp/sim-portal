import { redirect } from "next/navigation";
import { addSemester, getAllSemesters } from "@/actions/semesters";
import { getAllUsers } from "@/actions/users";
import SemesterForm from "@/app/semester/composition/SemesterForm";
import { getCurrentSemesterCode, normalizeSemesterCode } from "@/components/domain/filters/semester-filter";

export default async function AddSemesterFormContent() {
	const semestersResult = await getAllSemesters();
	const semesters = semestersResult.success ? semestersResult.data : [];
	// Prefer whichever semester actually matches today over semesters[0]
	// (newest by code) - production keeps future semesters pre-created for
	// planning ahead, and those would otherwise always outrank the real
	// current one as "newest", carrying over an empty roster instead of the
	// real current semester's members.
	const currentSemesterCode = getCurrentSemesterCode();
	const currentSemester = semesters.find(
		(semester) => normalizeSemesterCode(semester.name) === currentSemesterCode,
	) ?? semesters[0];
	const usersFromCurrentSemester = (currentSemester?.users || []).map((u: any) => ({ ...u, name: u.name }));

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
			semesters={semesters}
		/>
	);
}

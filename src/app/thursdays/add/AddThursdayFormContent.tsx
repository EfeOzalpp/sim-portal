import { redirect } from "next/navigation";
import { auth } from "@/authentication";
import { getAllUsers } from "@/actions/users";
import { getAllSemesters } from "@/actions/semesters";
import { createThursdayWithProductions } from "@/actions/thursdays";
import ThursdayForm from "@/app/thursdays/composition/ThursdayForm";

export default async function AddThursdayFormContent() {
	const session = await auth();
	const isAdmin = session?.user?.role === "ADMIN";

	if (!isAdmin) {
		redirect("/thursdays");
	}

	const usersResult = await getAllUsers();
	const users = usersResult.success ? usersResult.data : [];
	const semestersResult = await getAllSemesters();
	const semesters = semestersResult.success ? semestersResult.data : [];

	async function onSubmitAddThursday(data: any) {
		"use server";

		const result = await createThursdayWithProductions(data);
		if (result.success) {
			redirect(`/thursdays?thursdayId=${result.data.id}`);
		}
		return result;
	}

	return (
		<ThursdayForm
			users={users}
			semesters={semesters}
			onSubmit={onSubmitAddThursday}
		/>
	);
}

import { redirect } from "next/navigation";
import { auth } from "@/authentication";
import { addUser, getAllSemesters, handleImageUpload } from "@/actions/users";
import UserForm from "@/app/users/composition/UserForm";

export default async function AddUserFormContent() {
	const session = await auth();
	const isAdmin = session?.user?.role === "ADMIN";
	const semesters = await getAllSemesters();

	async function onSubmitAddUser(data: any) {
		"use server";

		if (data.image && typeof data.image === "object" && data.image.size > 0) {
			const imagePath = await handleImageUpload(data.image);
			data.image = imagePath;
		} else {
			data.image = "/face.jpg";
		}

		const result = await addUser(data);
		if (result.success) {
			redirect(`/users?profileUserId=${result.data.id}`);
		}
		return result;
	}

	if (!isAdmin) {
		redirect("/users/");
	}

	return (
		<UserForm
			onSubmit={onSubmitAddUser}
			isCurrentUserAdmin={isAdmin}
			allSemesters={semesters}
		/>
	);
}

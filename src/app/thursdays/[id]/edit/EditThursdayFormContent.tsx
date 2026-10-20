import { notFound, redirect } from "next/navigation";
import { getAllSemesters } from "@/actions/semesters";
import { getPresentationTagSuggestions, getProductionTagSuggestions, getThursday, updateThursdayWithProductions } from "@/actions/thursdays";
import { getAllUsers } from "@/actions/users";
import ThursdayForm from "@/app/thursdays/composition/forms";
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

	const [usersResult, semestersResult, tagSuggestionsResult, productionTagSuggestionsResult] = await Promise.all([
		getAllUsers(),
		getAllSemesters(),
		getPresentationTagSuggestions(),
		getProductionTagSuggestions(),
	]);
	const users = usersResult.success ? usersResult.data : [];
	const semesters = semestersResult.success ? semestersResult.data : [];
	const suggestedTags = tagSuggestionsResult.success ? tagSuggestionsResult.data : [];
	const suggestedProductionTags = productionTagSuggestionsResult.success ? productionTagSuggestionsResult.data : [];

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
			suggestedTags={suggestedTags}
			suggestedProductionTags={suggestedProductionTags}
			thursdayId={thursdayId}
			onSubmit={onSubmit}
		/>
	);
}

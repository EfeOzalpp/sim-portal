import { redirect } from "next/navigation";
import { USER_MODAL_PARAMS } from "@/constants/modal-params";

interface UserProps {
	params: Promise<{ id: string }>;
}

export default async function User({ params }: UserProps) {
	const { id } = await params;
	redirect(`/users?${USER_MODAL_PARAMS.profile}=${id}`);
}

import { redirect } from "next/navigation";
import { THURSDAY_MODAL_PARAMS } from "@/constants/modal-params";

interface ThursdayProps {
	params: Promise<{ id: string }>;
}

export default async function Thursday({ params }: ThursdayProps) {
	const { id } = await params;
	redirect(`/thursdays?${THURSDAY_MODAL_PARAMS.view}=${id}`);
}

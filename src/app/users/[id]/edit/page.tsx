import { redirect } from "next/navigation";
import { USER_MODAL_PARAMS } from "@/constants/modal-params";

interface EditUserProps {
  params: Promise<{ id: string }>;
}

export default async function EditUser({ params }: EditUserProps) {
  const { id } = await params;

  redirect(`/users?${USER_MODAL_PARAMS.edit}=${id}`);
}

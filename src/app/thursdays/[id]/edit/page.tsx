import { notFound } from "next/navigation";

import { getThursday } from "@/actions/thursdays";
import NavContent from "@/components/layout/NavContent";
import CloseButton from "@/components/primitives/CloseButton";
import EditThursdayFormContent from "@/app/thursdays/[id]/edit/EditThursdayFormContent";

interface EditThursdayProps {
	params: Promise<{ id: string }>;
}

export default async function EditThursday({ params }: EditThursdayProps) {
	const { id } = await params;

	const result = await getThursday(id);

	if (!result.success) {
		notFound();
	}

	return (
		<>
			<NavContent
				className="mx-auto max-w-[50%] border-b border-[var(--app-border)]"
				start={<h2>Edit Day</h2>}
				end={<CloseButton href={`/thursdays?thursdayId=${id}`} />}
			/>
			<div className="mx-auto max-w-[50%] pb-4">
				<div className="content-card">
					<EditThursdayFormContent thursdayId={id} />
				</div>
			</div>
		</>
	);
}

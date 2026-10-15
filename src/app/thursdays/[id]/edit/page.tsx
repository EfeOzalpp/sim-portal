// React & Next.js
import { notFound } from "next/navigation";

// Actions
import { getThursday } from "@/actions/thursdays";

// Components
import CloseButton from "@/components/primitives/CloseButton";

// Composition
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
			<header className="mx-auto flex max-w-[50%] items-center justify-between border-b border-[var(--page-bg-border)] py-3">
				<h2 className="m-0">Edit Day</h2>
				<CloseButton href={`/thursdays?thursdayId=${id}`} />
			</header>
			<div className="mx-auto max-w-[50%] pb-4">
				<div className="content-card">
					<EditThursdayFormContent thursdayId={id} />
				</div>
			</div>
		</>
	);
}

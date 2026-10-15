// React & Next.js
import { notFound } from "next/navigation";

// Actions
import { getSemester } from "@/actions/semesters";

// Components
import CloseButton from "@/components/primitives/CloseButton";

// Composition
import EditSemesterFormContent from "@/app/semester/[id]/edit/EditSemesterFormContent";

interface EditSemesterProps {
	params: Promise<{ id: string }>;
}

export default async function EditSemester({ params }: EditSemesterProps) {
	const { id } = await params;
	const result = await getSemester(id);
	if (!result.success) {
		notFound();
	}

	return (
		<>
			<header className="mx-auto flex max-w-[50%] items-center justify-between border-b border-b-[var(--page-bg-border)] py-3">
				<h2 className="m-0">Edit Semester</h2>
				<CloseButton href="/semester" />
			</header>
			<div className="mx-auto max-w-[50%] pb-4">
				<div className="content-card">
					<EditSemesterFormContent semesterId={id} />
				</div>
			</div>
		</>
	);
}

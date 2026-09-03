import { getSemester } from "@/actions/semesters";
import { notFound } from "next/navigation";
import NavContent from "@/components/layout/NavContent";
import CloseButton from "@/components/primitives/CloseButton";
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
			<NavContent
				className="mx-auto max-w-[50%] border-b border-b-[var(--app-border)]"
				start={<h2>Edit Semester</h2>}
				end={<CloseButton href="/semester" />}
			/>
			<div className="mx-auto max-w-[50%] pb-4">
				<div className="content-card">
					<EditSemesterFormContent semesterId={id} />
				</div>
			</div>
		</>
	);
}

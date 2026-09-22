// Components
import Link from "next/link";
import Button from "@/components/button";
import { MaskIcon } from "@/theme/MaskIcon";

// Helpers
import { formatSemesterCode } from "@/components/domain/filters/semester-filter";
import { ROLES } from "@/constants/roles";

function getEnrollmentParts(semester: any) {
	const users: any[] = semester.users || [];
	const studentCount = users.filter((user) => user.role === ROLES.student).length;
	const staffCount = users.filter((user) => user.role === ROLES.staff).length;
	const adminCount = users.filter((user) => user.role === ROLES.admin).length;

	const parts = [
		studentCount > 0 && `${studentCount} Student${studentCount === 1 ? "" : "s"}`,
		staffCount > 0 && `${staffCount} Staff`,
		adminCount > 0 && `${adminCount} Admin${adminCount === 1 ? "" : "s"}`,
	].filter(Boolean) as string[];

	return parts.length > 0 ? parts : ["No one enrolled yet"];
}

interface SemesterCardProps {
	semester: any;
	editHref: string;
	deleteHref: string;
}

function SemesterCard({ semester, editHref, deleteHref }: SemesterCardProps) {
	const semesterCode = formatSemesterCode(semester.name);
	const showSemesterName = semester.name && semester.name !== semesterCode;

	return (
		<article className="group relative box-border flex min-h-36 flex-col gap-2 overflow-hidden rounded-xl border border-[var(--elevated-surface-border)] bg-[var(--elevated-surface)] p-6 hover:bg-[var(--elevated-surface-hover)]">
			<div className="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 [--button-bg:var(--button-overlay-bg)] [--button-bg-hover:var(--button-overlay-bg-hover)]">
				<Button variant="icon" href={editHref} icon="edit/edit.svg" aria-label={`Edit ${semesterCode}`} />
				<Button variant="icon" tone="danger" href={deleteHref} icon="delete/delete.svg" aria-label={`Delete ${semesterCode}`} className="[--button-bg-hover:var(--button-delete-overlay-bg-hover)]" />
			</div>
			<div className="flex flex-col gap-2">
				<h3 className="m-0 text-[var(--app-text)]">{semesterCode}</h3>
				{showSemesterName && <p className="m-0 text-[var(--label-text)]">{semester.name}</p>}
				<div className="flex flex-col gap-0.5">
					{getEnrollmentParts(semester).map((part) => (
						<p key={part} className="m-0 text-[var(--subtle-text)]">{part}</p>
					))}
				</div>
			</div>
		</article>
	);
}

function AddSemesterCard({ href }: { href: string }) {
	return (
		<Link
			href={href}
			className="flex min-h-36 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--card-border)] bg-[var(--elevated-surface)]! text-[var(--label-text)] no-underline hover:border-[var(--card-border-hover)] hover:bg-[var(--elevated-surface-hover)]! hover:text-[var(--app-text)]"
		>
			<MaskIcon icon="add/add.svg" className="h-6 w-6 bg-current [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]" />
			<span className="font-semibold">New semester</span>
		</Link>
	);
}

interface SemesterCardGridProps {
	semesters: any[];
	addHref: string;
	getEditHref: (semesterId: string) => string;
	getDeleteHref: (semesterId: string) => string;
}

export default function SemesterCardGrid({ semesters, addHref, getEditHref, getDeleteHref }: SemesterCardGridProps) {
	return (
		<div className="grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] items-stretch gap-2">
			<AddSemesterCard href={addHref} />
			{semesters.map((semester: any) => (
				<SemesterCard
					key={semester.id}
					semester={semester}
					editHref={getEditHref(semester.id)}
					deleteHref={getDeleteHref(semester.id)}
				/>
			))}
		</div>
	);
}

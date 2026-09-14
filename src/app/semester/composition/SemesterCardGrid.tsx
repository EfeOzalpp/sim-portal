// Components
import Link from "next/link";
import { MaskIcon } from "@/theme/MaskIcon";

// Helpers
import { formatSemesterCode } from "@/components/domain/filters/semester-filter";
import { ROLES } from "@/constants/roles";

// Same convention as RoleFilterPopover's trigger button.
const iconButtonClassName =
	"m-0 inline-grid h-9 w-9 cursor-pointer place-items-center rounded-xl border border-solid border-[var(--input-border)] bg-[var(--btn-default-bg)] p-0 text-[var(--input-icon)] no-underline hover:border-[var(--input-border-hover)] hover:bg-[var(--input-bg-hover)] hover:text-[var(--input-text)] hover:shadow-[var(--input-hover-shadow)]";
const deleteIconButtonClassName =
	"m-0 inline-grid h-9 w-9 cursor-pointer place-items-center rounded-xl border border-solid border-[var(--action-delete-border)] bg-[var(--btn-default-bg)] p-0 text-[var(--action-delete-text)] no-underline hover:bg-[var(--action-delete-bg)] hover:shadow-[var(--input-hover-shadow)]";
const iconClassName = "h-4 w-4 bg-current [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]";

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
		<article className="group relative box-border flex min-h-36 flex-col gap-2 overflow-hidden rounded-xl bg-[var(--elevated-surface-2)] p-6 hover:bg-[var(--elevated-surface-hover-2)]">
			<div className="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
				<Link href={editHref} className={iconButtonClassName} aria-label={`Edit ${semesterCode}`}>
					<MaskIcon icon="edit/edit.svg" className={iconClassName} />
				</Link>
				<Link href={deleteHref} className={deleteIconButtonClassName} aria-label={`Delete ${semesterCode}`}>
					<MaskIcon icon="delete/delete.svg" className={iconClassName} />
				</Link>
			</div>
			<div className="flex flex-col gap-2">
				<h3 className="m-0 text-[var(--app-text)]">{semesterCode}</h3>
				{showSemesterName && <p className="m-0 text-[var(--app-label)]">{semester.name}</p>}
				<div className="flex flex-col gap-0.5">
					{getEnrollmentParts(semester).map((part) => (
						<p key={part} className="ui-note m-0">{part}</p>
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
			className="flex min-h-36 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--card-border)] text-[var(--app-label)] no-underline hover:bg-[var(--app-card-bg-hover)] hover:text-[var(--app-text)]"
		>
			<MaskIcon icon="add/add.svg" className="h-6 w-6 bg-current [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]" />
			<span className="font-semibold">New Semester</span>
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

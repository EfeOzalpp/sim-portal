// Components
import Link from "next/link";
import Button from "@/components/button";
import PeopleAvatarStack, { type PersonPreview } from "@/components/domain/profile/PeopleAvatarStack";
import { MaskIcon } from "@/theme/MaskIcon";

// Helpers
import { formatSemesterCode, getCurrentSemesterCode, normalizeSemesterCode } from "@/components/domain/filters/semester-filter";
import { ROLES } from "@/constants/roles";

const enrollmentRoles = [
	{ role: ROLES.student, label: "Students" },
	{ role: ROLES.staff, label: "Staff" },
	{ role: ROLES.admin, label: "Admins" },
];

interface SemesterCardProps {
	semester: any;
	editHref: string;
	deleteHref: string;
}

function SemesterCard({ semester, editHref, deleteHref }: SemesterCardProps) {
	const semesterCode = formatSemesterCode(semester.name);
	const isCurrent = normalizeSemesterCode(semester.name) === getCurrentSemesterCode();
	const showSemesterName = semester.name && semester.name !== semesterCode;
	const users: (PersonPreview & { role: string })[] = semester.users || [];

	return (
		<article className="group relative mx-auto box-border min-h-36 w-[90%] overflow-hidden rounded-none bg-transparent transition-colors duration-150 after:absolute after:right-0 after:bottom-0 after:left-0 after:h-0.5 after:bg-[var(--card-border)] after:transition-colors hover:bg-[var(--page-card-hover)] hover:after:bg-[var(--card-border-hover)]">
			<div className="absolute top-2 right-2 z-[2] flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 print:hidden [--page-icon-bg:var(--button-overlay-bg)] [--page-icon-shadow:var(--button-overlay-shadow)] [--page-icon-bg-hover:var(--button-overlay-bg-hover)]">
				<Button surface="page" variant="tool" href={editHref} icon="edit/edit.svg" aria-label={`Edit ${semesterCode}`} />
				<Button surface="page" variant="tool" tone="danger" href={deleteHref} icon="delete/delete.svg" aria-label={`Delete ${semesterCode}`} className="[--page-icon-bg-hover:var(--button-delete-overlay-bg-hover)] [--button-danger-icon-text:var(--button-delete-overlay-text)]" />
			</div>
			<div className="relative z-[1] flex h-full min-h-36 flex-col gap-3 px-4 py-4 no-underline">
				<h3 className="m-0 flex items-center gap-1 pr-16 text-[var(--app-text)]">
					{isCurrent && (
						<span className="inline-flex shrink-0" role="img" aria-label="Current semester" title="Current semester">
							<MaskIcon icon="fiber_today/fiber_today.svg" className="h-5 w-5 bg-[var(--select-checkbox-active-bg)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]" />
						</span>
					)}
					{semesterCode}
				</h3>
				{showSemesterName && <p className="m-0 pr-8 text-[var(--label-text)]">{semester.name}</p>}
				<div className="flex flex-col gap-2 pr-8 text-sm text-[var(--subtle-text)]">
					{users.length > 0 ? enrollmentRoles.map(({ role, label }) => {
						const people = users.filter((user) => user.role === role);
						if (people.length === 0) return null;

						return (
							<div key={role} className="grid items-center gap-x-3 gap-y-1 min-[769px]:grid-cols-[4rem_minmax(0,1fr)]" aria-label={`${people.length} ${label.toLowerCase()}`}>
								<span>{label}</span>
								<PeopleAvatarStack count={people.length} people={people} />
							</div>
						);
					}) : <span className="italic text-[var(--content-muted)]">No one enrolled yet</span>}
				</div>
				<span className="pointer-events-none absolute top-1/2 right-5 flex -translate-y-1/2 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100" aria-hidden="true">
					<MaskIcon icon="view/forward.svg" className="h-5 w-5 flex-none bg-[var(--app-text)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]" />
				</span>
			</div>
		</article>
	);
}

function AddSemesterCard({ href }: { href: string }) {
	return (
		<Link
			href={href}
			className="mx-auto flex min-h-36 w-[90%] flex-col items-center justify-center gap-2 rounded-none border-0 border-b-2 border-solid border-[var(--card-border)] bg-transparent text-[var(--label-text)] no-underline transition-colors hover:border-[var(--card-border-hover)] hover:bg-[var(--page-card-hover)] hover:text-[var(--app-text)]"
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
		<div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,max(8rem,calc((100%_-_0.5rem)/2))),1fr))] items-stretch gap-x-3 gap-y-6 min-[769px]:grid-cols-[repeat(auto-fill,minmax(min(100%,18rem),1fr))]">
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

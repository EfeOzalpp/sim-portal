import PersonLink from "@/components/domain/profile/PersonLink";
import { ROLES } from "@/constants/roles";

interface SemesterEnrollmentModalContentProps {
	semester: any;
}

const roleGroups = [
	{ label: "Students", role: ROLES.student, empty: "No students enrolled." },
	{ label: "Faculty", role: ROLES.staff, empty: "No faculty enrolled." },
	{ label: "Admin", role: ROLES.admin, empty: "No admins enrolled." },
] as const;

const personLinkClassName =
	"min-w-0 wrap-break-word text-inherit! no-underline underline-offset-[0.14em] hover:text-[var(--inline-link-hover)]! hover:underline";

export default function SemesterEnrollmentModalContent({ semester }: SemesterEnrollmentModalContentProps) {
	const users: any[] = [...(semester?.users || [])].sort((a, b) => (a.name || "").localeCompare(b.name || ""));

	return (
		<div className="@container flex flex-col gap-6 pt-4 pr-12">
			{roleGroups.map((group) => {
				const people = users.filter((user) => user.role === group.role);

				return (
					<section key={group.role} className="flex min-w-0 flex-col gap-2">
						<span className={people.length > 0 ? "ui-label" : "ui-label text-[var(--content-muted)]"}>
							{group.label}
						</span>
						{people.length > 0 ? (
							<div className="grid grid-cols-1 gap-x-6 gap-y-1 @min-[22rem]:grid-cols-2 @min-[34rem]:grid-cols-3">
								{people.map((person) => (
									<PersonLink key={person.id} userId={person.id} className={personLinkClassName}>
										{person.name}
									</PersonLink>
								))}
							</div>
						) : (
							<span className="ui-note text-[var(--content-muted)]">{group.empty}</span>
						)}
					</section>
				);
			})}
		</div>
	);
}

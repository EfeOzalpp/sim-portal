"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useActionMode } from "@/components/layout/ActionMode";
import { formatSemesterCode } from "@/components/domain/semesters/semester-filter";

const dateFormat: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };

function getSemesterDateRange(semester: any) {
	const dates = (semester.thursdays || [])
		.map((thursday: any) => new Date(thursday.date))
		.filter((date: Date) => !Number.isNaN(date.getTime()));

	if (dates.length < 1) {
		return "Dates TBD";
	}

	const startDate = dates[0];
	const endDate = dates[dates.length - 1];

	return `${startDate.toLocaleDateString("en-US", dateFormat)} - ${endDate.toLocaleDateString("en-US", dateFormat)}`;
}

function SemesterCard({ semester }: { semester: any }) {
	const semesterCode = formatSemesterCode(semester.name);
	const showSemesterName = semester.name && semester.name !== semesterCode;

	return (
		<article className="relative box-border flex min-h-36 flex-col gap-6 overflow-hidden rounded-xl border-solid border-[var(--app-border)] bg-[var(--app-card-bg)] p-6 border hover:bg-[var(--app-card-bg-hover)]">
			<div className="flex flex-col gap-2">
				<h3 className="m-0 text-[var(--app-text)]">{semesterCode}</h3>
				{showSemesterName && <p className="m-0 text-[var(--app-muted)]">{semester.name}</p>}
			</div>
			<p className="m-0 mt-auto text-sm font-semibold text-[var(--app-muted)]">
				{getSemesterDateRange(semester)}
			</p>
			<span
				className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center bg-[var(--app-card-action-overlay)] text-[var(--app-card-action-icon)] opacity-0"
				data-semester-action-overlay
				aria-hidden="true"
			>
				<span className="h-7 w-7 origin-center scale-100 bg-current [mask-image:var(--semester-card-action-icon)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]" />
			</span>
		</article>
	);
}

interface SemesterCardGridProps {
	semesters: any[];
}

export default function SemesterCardGrid({ semesters }: SemesterCardGridProps) {
	const { activeMode } = useActionMode();
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	function openSemesterModal(semesterId: string, modalParam: "editSemesterId" | "deleteSemesterId") {
		const params = new URLSearchParams(searchParams.toString());
		params.delete("addSemester");
		params.delete("editSemesterId");
		params.delete("deleteSemesterId");
		params.set(modalParam, semesterId);
		router.push(`${pathname}?${params.toString()}`, { scroll: false });
	}

	return (
		<div className="grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] items-stretch gap-4">
			{semesters.map((semester: any) => (
				<div
					key={semester.id}
					data-action-mode-target="semester-card"
					data-semester-id={semester.id}
					onClick={() => {
						if (activeMode === "edit-semesters") {
							openSemesterModal(semester.id, "editSemesterId");
							return;
						}

						if (activeMode === "delete-semesters") {
							openSemesterModal(semester.id, "deleteSemesterId");
						}
					}}
				>
					<SemesterCard semester={semester} />
				</div>
			))}
		</div>
	);
}

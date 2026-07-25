"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useActionMode } from "@/components/layout/ActionMode";
import { formatSemesterCode } from "@/components/domain/semesters/semester-filter";
import styles from "@/app/semester/page.module.css";

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
		<article className={styles.semesterCard}>
			<div className={styles.semesterCardHeader}>
				<h3 className={styles.semesterCode}>{semesterCode}</h3>
				{showSemesterName && <p className={styles.semesterName}>{semester.name}</p>}
			</div>
			<p className={styles.semesterDates}>{getSemesterDateRange(semester)}</p>
			<span className={styles.semesterActionOverlay} data-semester-action-overlay aria-hidden="true">
				<span className={styles.semesterActionOverlayIcon} />
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
		<div className={styles.semesterGrid}>
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

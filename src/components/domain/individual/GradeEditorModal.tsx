"use client";

import { useEffect, useState } from "react";
import ModalPopup from "@/components/modals/ModalPopup";
import { Alert, Button } from "@/components/primitives/AntD";
import styles from "@/components/domain/individual/GradeEditorModal.module.css";

export type GradeValue = "P" | "NC" | "INC" | "W";
export type GradeMap = Record<string, GradeValue | null | undefined>;

interface GradeSemester {
	id: string;
	name: string;
}

interface GradeUser {
	id: string;
	name: string | null;
	semesters?: GradeSemester[];
}

interface GradeEditorModalProps {
	user: GradeUser | null;
	value: GradeMap;
	onChange: (nextValue: GradeMap) => Promise<void> | void;
	onClose: () => void;
}

const gradeOptions: GradeValue[] = ["P", "NC", "INC", "W"];

function GradeOptionButton({
	grade,
	selected,
	onClick,
}: {
	grade: GradeValue;
	selected: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			className={styles.gradeOption}
			data-selected={selected ? "true" : undefined}
			onClick={onClick}
		>
			<span>{grade}</span>
		</button>
	);
}

export default function GradeEditorModal({
	user,
	value,
	onChange,
	onClose,
}: GradeEditorModalProps) {
	const [draft, setDraft] = useState<GradeMap>(value);
	const [error, setError] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const semesters = user?.semesters || [];

	useEffect(() => {
		setDraft(value);
		setError(null);
		setIsSaving(false);
	}, [value, user?.id]);

	function setSemesterGrade(semesterId: string, grade: GradeValue | undefined) {
		setDraft((current) => ({
			...current,
			[semesterId]: current[semesterId] === grade ? null : grade,
		}));
	}

	if (!user) {
		return null;
	}

	return (
		<ModalPopup
			open
			onOpenChange={(isOpen) => {
				if (!isOpen) {
					onClose();
				}
			}}
			title={`Edit Grades: ${user.name || "Student"}`}
			dialogClassName={styles.dialog}
		>
			<div className={styles.root}>
				{error && (
					<Alert
						description={error}
						type="error"
						showIcon
						closable
						onClose={() => setError(null)}
					/>
				)}

				<div className={styles.semesterList}>
					{semesters.length > 0 ? (
						semesters.map((semester) => (
							<div key={semester.id} className={styles.semesterRow}>
								<div>
									<span className="ui-label">Semester of Grade</span>
									<div className={styles.semesterName}>{semester.name}</div>
								</div>
								<div className={styles.gradeColumn}>
									<span className="ui-label">Grade</span>
									<div className={styles.gradeOptions}>
										{gradeOptions.map((grade) => (
											<GradeOptionButton
												key={grade}
												grade={grade}
												selected={draft[semester.id] === grade}
												onClick={() => setSemesterGrade(semester.id, grade)}
											/>
										))}
									</div>
								</div>
							</div>
						))
					) : (
						<p className="ui-note">This student is not enrolled in any semesters yet.</p>
					)}
				</div>

				<p className="ui-note">
					To add new semester for student, edit their profile information.
				</p>

				<Button
					htmlType="button"
					className="accept-button"
					disabled={isSaving}
					onClick={async () => {
						setError(null);
						setIsSaving(true);

						try {
							await onChange(draft);
							onClose();
						} catch (error) {
							setError(error instanceof Error ? error.message : "Could not save grades.");
						} finally {
							setIsSaving(false);
						}
					}}
				>
					{isSaving ? "Saving..." : "Save Grades"}
				</Button>
			</div>
		</ModalPopup>
	);
}

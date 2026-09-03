"use client";

import { useEffect, useState } from "react";
import ModalPopup from "@/components/modal";
import { Alert } from "@/components/alert";
import { Button } from "@/components/button";

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
			className="inline-flex min-h-9 min-w-[3.25rem] cursor-pointer items-center justify-center rounded-md border-solid border-[var(--app-border)] bg-[var(--app-surface)] px-2 border [font:inherit] hover:bg-[var(--nav-button-bg-hover)] data-[selected=true]:bg-[var(--tone-success-bg)] data-[selected=true]:border-[var(--tone-success-border)] data-[selected=true]:text-[var(--tone-success-text)] data-[selected=true]:font-semibold"
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
			dialogClassName="w-[min(38rem,100%)]"
		>
			<div className="flex flex-col gap-6">
				{error && (
					<Alert
						description={error}
						tone="danger"
						showIcon
						closable
						onClose={() => setError(null)}
					/>
				)}

				<div className="flex flex-col gap-4">
					{semesters.length > 0 ? (
						semesters.map((semester) => (
							<div
								key={semester.id}
								className="grid grid-cols-[minmax(8rem,0.8fr)_minmax(0,1.2fr)] items-center gap-6 rounded-xl border-solid border-[var(--app-border)] bg-[var(--app-subtle)] p-4 border max-[768px]:grid-cols-1"
							>
								<div>
									<span className="ui-label">Semester of Grade</span>
									<div className="mt-1 font-heading text-xl leading-tight font-semibold">
										{semester.name}
									</div>
								</div>
								<div className="flex min-w-0 flex-col gap-1">
									<span className="ui-label">Grade</span>
									<div className="flex min-w-0 flex-wrap gap-2">
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
					type="button"
					tone="success"
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

"use client";

import { useEffect, useState } from "react";
import ModalPopup from "@/components/modals/ModalPopup";
import { Alert, Button } from "@/components/primitives/AntD";

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
			className="inline-flex min-h-9 min-w-[3.25rem] cursor-pointer items-center justify-center rounded-[var(--border-sm)] border-solid border-[var(--app-border)] bg-[var(--app-surface)] px-[var(--spacing-sm)] [border-width:var(--app-border-width)] [font:inherit] hover:bg-[var(--nav-button-bg-hover)] data-[selected=true]:[background:var(--button-bg-active,#b9e2c9)] data-[selected=true]:[border-color:var(--button-border-active,#98c9ad)] data-[selected=true]:[color:var(--button-text-active,#143821)] data-[selected=true]:font-[var(--font-weight-semibold)] dark:data-[selected=true]:border-[#548a69] dark:data-[selected=true]:bg-[#4c7154] dark:data-[selected=true]:text-white"
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
			<div className="flex flex-col gap-[var(--gap-lg)]">
				{error && (
					<Alert
						description={error}
						type="error"
						showIcon
						closable
						onClose={() => setError(null)}
					/>
				)}

				<div className="flex flex-col gap-[var(--gap-md)]">
					{semesters.length > 0 ? (
						semesters.map((semester) => (
							<div
								key={semester.id}
								className="grid grid-cols-[minmax(8rem,0.8fr)_minmax(0,1.2fr)] items-center gap-[var(--gap-lg)] rounded-[var(--border-md)] border-solid border-[var(--app-border)] bg-[var(--app-subtle)] p-[var(--spacing-md)] [border-width:var(--app-border-width)] max-[768px]:grid-cols-1"
							>
								<div>
									<span className="ui-label">Semester of Grade</span>
									<div className="mt-[calc(var(--spacing-sm)/2)] font-[family-name:var(--font-family-heading)] text-[length:var(--font-size-h3)] leading-[var(--line-height-tight)] font-[var(--font-weight-semibold)]">
										{semester.name}
									</div>
								</div>
								<div className="flex min-w-0 flex-col gap-[calc(var(--gap-sm)/2)]">
									<span className="ui-label">Grade</span>
									<div className="flex min-w-0 flex-wrap gap-[var(--gap-sm)]">
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

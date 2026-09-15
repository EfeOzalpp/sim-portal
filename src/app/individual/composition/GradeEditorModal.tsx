"use client";

// React & Next.js
import { useEffect, useState } from "react";

// Components
import ModalPopup from "@/components/modal";
import { useModalCloseGuard } from "@/components/modal/CloseGuard";
import { Alert } from "@/components/alert";
import { Button } from "@/components/button";
import { MaskIcon } from "@/theme/MaskIcon";

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
			className="inline-flex min-h-9 min-w-[3.25rem] cursor-pointer items-center justify-center rounded-md border-0 bg-[var(--app-subtle-2)] px-2 [font:inherit] hover:bg-[var(--nav-button-bg-hover)] data-[selected=true]:bg-[var(--select-active-bg)] data-[selected=true]:text-[var(--select-active-text)] data-[selected=true]:font-semibold"
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

	async function handleSave() {
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
	}

	useModalCloseGuard(JSON.stringify(draft) !== JSON.stringify(value) && !isSaving, true, handleSave);

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
			title={`Edit ${user.name || "Student"}'s Grade`}
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

				<p className="ui-note m-0 flex items-center gap-1.5">
					<MaskIcon
						icon="info/info.svg"
						className="h-[1.375rem] w-[1.375rem] shrink-0 bg-current [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]"
					/>
					<span>Only the semesters this student is registered to are shown here.</span>
				</p>

				<div className="flex flex-col gap-4">
					{semesters.length > 0 ? (
						semesters.map((semester) => (
							<div
								key={semester.id}
								className="grid grid-cols-[minmax(8rem,0.8fr)_minmax(0,1.2fr)] items-center gap-6 rounded-xl bg-[var(--app-subtle)] p-4 [&>*:last-child]:-ml-6 max-[768px]:grid-cols-1 max-[768px]:[&>*:last-child]:ml-0"
							>
								<div className="font-heading text-xl leading-tight font-semibold">
									{semester.name}
								</div>
								<div className="flex min-w-0 flex-wrap items-center gap-3">
									<span className="ui-label">Grade</span>
									<div className="flex flex-wrap items-center gap-2">
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

				<Button
					type="button"
					tone="success"
					disabled={isSaving}
					onClick={handleSave}
				>
					{isSaving ? "Saving..." : "Save Grades"}
				</Button>
			</div>
		</ModalPopup>
	);
}

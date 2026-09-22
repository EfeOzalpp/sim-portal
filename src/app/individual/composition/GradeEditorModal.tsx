"use client";

// React & Next.js
import { useEffect, useState } from "react";

// Components
import ModalPopup from "@/components/modal";
import { useModalCloseGuard } from "@/components/modal/CloseGuard";
import { Alert } from "@/components/alert";
import { Button } from "@/components/button";
import { useToast } from "@/components/toast";
import { getLabelColors } from "@/constants/labelColors";

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
	const selectedColors = selected ? getLabelColors(`grade:${grade}`) : undefined;

	return (
		<button
			type="button"
			className="inline-flex min-h-9 min-w-[3.25rem] cursor-pointer items-center justify-center rounded-md border-0 bg-[var(--app-subtle-2)] px-2 [font:inherit] hover:bg-[var(--app-subtle-2-hover)] data-[selected=true]:font-semibold"
			data-selected={selected ? "true" : undefined}
			style={selectedColors ? { backgroundColor: selectedColors.bg, color: selectedColors.text } : undefined}
			onClick={onClick}
		>
			<span>{grade}</span>
		</button>
	);
}

interface GradeEditorFormProps {
	user: GradeUser;
	value: GradeMap;
	onChange: (nextValue: GradeMap) => Promise<void> | void;
	onClose: () => void;
}

// Split out from GradeEditorModal so useModalCloseGuard runs inside
// ModalPopup's own children - ModalCloseGuardProvider only wraps those, not
// the component that renders <ModalPopup> itself, so calling the hook up in
// GradeEditorModal's body would silently no-op (no provider above it).
function GradeEditorForm({ user, value, onChange, onClose }: GradeEditorFormProps) {
	const [draft, setDraft] = useState<GradeMap>(value);
	const [error, setError] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const semesters = user.semesters || [];
	const toast = useToast();

	useEffect(() => {
		setDraft(value);
		setError(null);
		setIsSaving(false);
	}, [value, user.id]);

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
			toast.success("Grades saved");
			onClose();
		} catch (error) {
			setError(error instanceof Error ? error.message : "Could not save grades.");
		} finally {
			setIsSaving(false);
		}
	}

	useModalCloseGuard(JSON.stringify(draft) !== JSON.stringify(value) && !isSaving, true, handleSave);

	return (
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
							className="grid grid-cols-[minmax(8rem,0.8fr)_minmax(0,1.2fr)] items-center gap-6 rounded-xl bg-[var(--app-subtle)] p-4 max-[768px]:grid-cols-1"
						>
							<h3 className="m-0">
								{semester.name}
							</h3>
							<div className="flex min-w-0 flex-wrap items-center justify-end gap-3 max-[768px]:justify-start">
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
				{isSaving ? "Saving..." : "Save grades"}
			</Button>
		</div>
	);
}

export default function GradeEditorModal({
	user,
	value,
	onChange,
	onClose,
}: GradeEditorModalProps) {
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
			title={`${user.name || "Student"}'s Grade`}
			dialogClassName="w-[min(30rem,100%)]"
		>
			<GradeEditorForm key={user.id} user={user} value={value} onChange={onChange} onClose={onClose} />
		</ModalPopup>
	);
}

"use client";

import { useState, useEffect, type ChangeEvent } from "react";
import { LoadingOutlined } from "@ant-design/icons";
import { MaskIcon } from "@/theme/MaskIcon";

interface ImageUploadProps {
	onChange: (file: File) => void;
	currentImagePath?: string;
	// The form's own submitting state - a spinner only makes sense to show
	// once there's actually a new file picked (objectUrl below) and the form
	// is mid-submit, since that's the only window an upload is really happening.
	isSubmitting?: boolean;
}

const MAX_SIZE_MB = 4;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function ImageUpload({ onChange, currentImagePath = "/face.jpg", isSubmitting = false }: ImageUploadProps) {
	const [preview, setPreview] = useState<string | null>(null);
	const [objectUrl, setObjectUrl] = useState<string | null>(null);
	const isUploading = isSubmitting && objectUrl !== null;

	useEffect(() => {
		if (currentImagePath && typeof currentImagePath === "string") {
			setPreview(currentImagePath);
		}
	}, [currentImagePath]);

	useEffect(() => {
		return () => {
			if (objectUrl) URL.revokeObjectURL(objectUrl);
		};
	}, [objectUrl]);

	function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		event.target.value = ""; // allow re-selecting the same file later

		if (!file) return;
		if (!ACCEPTED_TYPES.includes(file.type)) return;
		if (file.size / 1024 / 1024 >= MAX_SIZE_MB) return;

		if (objectUrl) URL.revokeObjectURL(objectUrl);
		const nextObjectUrl = URL.createObjectURL(file);
		setObjectUrl(nextObjectUrl);
		setPreview(nextObjectUrl);
		onChange(file);
	}

	return (
		// Dashed, like SemesterCardGrid's "New Semester" add-card - same
		// "drop something in here" language. p-2 keeps the actual photo/
		// placeholder from running right up to that dashed edge, so it reads
		// as a deliberate frame instead of the image just filling the box.
		<label className="relative flex h-[7.5rem] w-[7.5rem] cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-[var(--card-border)] bg-[var(--app-subtle)] p-2 hover:border-[var(--card-border-hover)]">
			<input
				type="file"
				accept="image/jpeg,image/png,image/webp"
				className="sr-only"
				onChange={handleFileChange}
				disabled={isUploading}
			/>
			<div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-lg">
				{isUploading && (
					<span className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--scrim)]" aria-hidden="true">
						<LoadingOutlined spin style={{ fontSize: "1.5rem", color: "var(--app-theme)" }} />
					</span>
				)}
				{preview ? (
					preview === "/face.jpg" ? (
						// Default placeholder (no photo chosen/uploaded yet) - same person
						// icon FaceImage shows for cards/profiles, not a real image.
						<span className="flex h-full w-full items-center justify-center" aria-hidden="true">
							<MaskIcon icon="person/person.svg" className="h-1/3 w-1/3 bg-[var(--subtle-text)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]" />
						</span>
					) : (
						<img src={preview} alt="avatar" className="h-full w-full object-cover" />
					)
				) : (
					<span className="flex flex-col items-center gap-1 text-[var(--label-text)]">
						<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-[1.375rem] w-[1.375rem]">
							<path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
						</svg>
						<span className="text-sm">Upload photo</span>
					</span>
				)}
			</div>
		</label>
	);
}

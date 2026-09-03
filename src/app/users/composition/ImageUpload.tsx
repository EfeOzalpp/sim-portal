"use client";

import { useState, useEffect, type ChangeEvent } from "react";

interface ImageUploadProps {
	onChange: (file: File) => void;
	currentImagePath?: string;
}

const MAX_SIZE_MB = 8;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function ImageUpload({ onChange, currentImagePath = "/face.jpg" }: ImageUploadProps) {
	const [preview, setPreview] = useState<string | null>(null);
	const [objectUrl, setObjectUrl] = useState<string | null>(null);

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
		<label className="relative flex h-[7.5rem] w-[7.5rem] cursor-pointer items-center justify-center overflow-hidden rounded-[var(--border-md)] border-solid border-[var(--app-border)] bg-[var(--app-subtle)] [border-width:var(--app-border-width)] hover:border-[var(--input-border-hover)]">
			<input
				type="file"
				accept="image/jpeg,image/png,image/webp"
				className="sr-only"
				onChange={handleFileChange}
			/>
			{preview ? (
				<img src={preview} alt="avatar" className="h-full w-full object-cover" />
			) : (
				<span className="flex flex-col items-center gap-[calc(var(--gap-sm)/2)] text-[var(--app-muted)]">
					<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-[var(--svg-size-md)] w-[var(--svg-size-md)]">
						<path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
					</svg>
					<span className="text-[length:var(--font-size-sm)]">Upload Photo</span>
				</span>
			)}
		</label>
	);
}

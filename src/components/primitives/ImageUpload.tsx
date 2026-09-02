"use client";

import React, { useState, useEffect } from "react";
import { Upload } from "@/components/primitives/AntD";
import { PlusOutlined } from "@ant-design/icons";

interface ImageUploadProps {
	onChange: (file: File) => void;
	currentImagePath?: string;
}

export default function ImageUpload({ onChange, currentImagePath = "/face.jpg" }: ImageUploadProps) {
	const [preview, setPreview] = useState<string | null>(null);
	const [objectUrl, setObjectUrl] = useState<string | null>(null);

	const MAX_SIZE_MB = 8;

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

	const beforeUpload = (file: File) => {
		const isSupportedImage = ["image/jpeg", "image/png", "image/webp"].includes(file.type);
		if (!isSupportedImage) {
			return false;
		}
		const isLt8M = file.size / 1024 / 1024 < MAX_SIZE_MB;
		if (!isLt8M) {
			return false;
		}

		if (objectUrl) URL.revokeObjectURL(objectUrl);
		const nextObjectUrl = URL.createObjectURL(file);
		setObjectUrl(nextObjectUrl);
		setPreview(nextObjectUrl);
		onChange(file);

		return false; // Prevent auto upload
	};

	const uploadButton = (
		<div style={{ padding: "20px" }}>
			<PlusOutlined />
			<div style={{ marginTop: 8 }}>Upload Photo</div>
		</div>
	);

	return (
		<Upload
			listType="picture-card"
			showUploadList={false}
			beforeUpload={beforeUpload as any}
			accept="image/jpeg,image/png,image/webp"
			style={{ width: 120, height: 120, overflow: "hidden" }}
		>
			{preview ? (
				<img 
					src={preview} 
					alt="avatar" 
					style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit" }} 
				/>
			) : (
				uploadButton
			)}
		</Upload>
	);
}

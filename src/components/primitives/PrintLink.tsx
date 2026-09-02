"use client";

import { Button } from "@/components/primitives/AntD/Button";

interface PrintLinkProps {
	label?: string;
}

export default function PrintLink({ label = "Print" }: PrintLinkProps) {
	return (
		<Button
			htmlType="button"
			className="link-button"
			onClick={() => window.print()}
		>
			<span className="link-button-content">
				<span className="link-button-icon link-button-download-icon" aria-hidden="true" />
				<span>{label}</span>
			</span>
		</Button>
	);
}

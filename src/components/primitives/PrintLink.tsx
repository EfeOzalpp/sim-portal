"use client";

import { Button } from "@/components/button/button-component";

interface PrintLinkProps {
	label?: string;
}

export default function PrintLink({ label = "Print" }: PrintLinkProps) {
	return (
		<Button
			type="button"
			variant="link"
			onClick={() => window.print()}
		>
			<span className="link-button-content">
				<span className="link-button-icon link-button-download-icon" aria-hidden="true" />
				<span>{label}</span>
			</span>
		</Button>
	);
}

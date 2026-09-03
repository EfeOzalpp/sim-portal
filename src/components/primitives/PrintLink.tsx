"use client";

import { Button } from "@/components/button";

interface PrintLinkProps {
	label?: string;
}

export default function PrintLink({ label = "Print" }: PrintLinkProps) {
	return (
		<Button
			type="button"
			variant="link"
			icon="download/download.svg"
			onClick={() => window.print()}
		>
			{label}
		</Button>
	);
}
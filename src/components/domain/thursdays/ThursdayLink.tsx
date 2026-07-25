"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

type ThursdayLinkProps = {
	thursdayId: string;
	children: ReactNode;
	className?: string;
};

export default function ThursdayLink({ thursdayId, children, className }: ThursdayLinkProps) {
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const params = new URLSearchParams(searchParams.toString());
	params.delete("thursdayId");
	params.set("thursdayId", thursdayId);

	return (
		<Link href={`${pathname}?${params.toString()}`} className={className}>
			{children}
		</Link>
	);
}

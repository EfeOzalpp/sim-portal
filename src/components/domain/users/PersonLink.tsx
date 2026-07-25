"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

type PersonLinkProps = {
	userId: string;
	children: ReactNode;
	className?: string;
};

export default function PersonLink({ userId, children, className }: PersonLinkProps) {
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const params = new URLSearchParams(searchParams.toString());
	["profileUserId", "accountProfile", "accountEdit"].forEach((p) => params.delete(p));
	params.set("profileUserId", userId);

	return (
		<Link href={`${pathname}?${params.toString()}`} className={className}>
			{children}
		</Link>
	);
}

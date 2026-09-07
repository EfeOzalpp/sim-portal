"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { ACCOUNT_MODAL_PARAMS, USER_MODAL_PARAMS } from "@/constants/modal-params";

type PersonLinkProps = {
	userId: string;
	children: ReactNode;
	className?: string;
};

export default function PersonLink({ userId, children, className }: PersonLinkProps) {
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const params = new URLSearchParams(searchParams.toString());
	[USER_MODAL_PARAMS.profile, ACCOUNT_MODAL_PARAMS.profile, ACCOUNT_MODAL_PARAMS.edit].forEach((p) => params.delete(p));
	params.set(USER_MODAL_PARAMS.profile, userId);

	return (
		<Link href={`${pathname}?${params.toString()}`} className={className}>
			{children}
		</Link>
	);
}

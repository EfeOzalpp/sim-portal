"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { THURSDAY_MODAL_PARAMS } from "@/constants/modal-params";

type ThursdayLinkProps = {
	thursdayId: string;
	children: ReactNode;
	className?: string;
};

export default function ThursdayLink({ thursdayId, children, className }: ThursdayLinkProps) {
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const params = new URLSearchParams(searchParams.toString());
	params.delete(THURSDAY_MODAL_PARAMS.view);
	params.set(THURSDAY_MODAL_PARAMS.view, thursdayId);

	return (
		<Link href={`${pathname}?${params.toString()}`} className={className}>
			{children}
		</Link>
	);
}

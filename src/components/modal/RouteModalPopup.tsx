"use client";

import { ReactNode, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ModalPopup from "@/components/modal";

interface RouteModalPopupProps {
	paramName: string;
	title: ReactNode;
	children: ReactNode;
	dialogClassName?: string;
}

export default function RouteModalPopup({
	paramName,
	title,
	children,
	dialogClassName,
}: RouteModalPopupProps) {
	const [isOpen, setIsOpen] = useState(true);
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	function closeModal() {
		setIsOpen(false);

		const params = new URLSearchParams(searchParams.toString());
		params.delete(paramName);
		const query = params.toString();
		router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
	}

	return (
		<ModalPopup
			open={isOpen}
			onOpenChange={(nextOpen) => {
				if (!nextOpen) {
					closeModal();
				}
			}}
			title={title}
			dialogClassName={dialogClassName}
		>
			{children}
		</ModalPopup>
	);
}

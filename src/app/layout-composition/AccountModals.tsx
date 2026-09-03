"use client";

import type { ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import RouteModalPopup from "@/components/modal/RouteModalPopup";

interface AccountModalsProps {
	profile: ReactNode;
	edit: ReactNode;
	profileDialogClassName?: string;
}

export default function AccountModals({
	profile,
	edit,
	profileDialogClassName,
}: AccountModalsProps) {
	const searchParams = useSearchParams();

	if (searchParams.has("accountEdit")) {
		return (
			<RouteModalPopup key="account-edit" paramName="accountEdit" title="Edit Profile">
				{edit}
			</RouteModalPopup>
		);
	}

	if (searchParams.has("accountProfile")) {
		return (
			<RouteModalPopup
				key="account-profile"
				paramName="accountProfile"
				title="Your Profile"
				dialogClassName={profileDialogClassName}
			>
				{profile}
			</RouteModalPopup>
		);
	}

	return null;
}

"use client";

import type { ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import RouteModalPopup from "@/components/modal/RouteModalPopup";
import { ACCOUNT_MODAL_PARAMS } from "@/constants/modal-params";

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

	if (searchParams.has(ACCOUNT_MODAL_PARAMS.edit)) {
		return (
			<RouteModalPopup key="account-edit" paramName={ACCOUNT_MODAL_PARAMS.edit} title="Edit Profile">
				{edit}
			</RouteModalPopup>
		);
	}

	if (searchParams.has(ACCOUNT_MODAL_PARAMS.profile)) {
		return (
			<RouteModalPopup
				key="account-profile"
				paramName={ACCOUNT_MODAL_PARAMS.profile}
				title="Your Profile"
				dialogClassName={profileDialogClassName}
			>
				{profile}
			</RouteModalPopup>
		);
	}

	return null;
}

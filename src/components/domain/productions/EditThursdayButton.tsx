"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/button";
import { THURSDAY_MODAL_PARAMS } from "@/constants/modal-params";

interface EditThursdayButtonProps {
	thursdayId: string;
	className?: string;
}

// Swaps to the exact same Edit Thursday modal the "Edit Thursdays" action
// mode opens (see ProductionsCollapse's openThursdayModal) - clears the
// other Thursday modal params so this replaces whichever one is currently
// open (the View modal, in practice) instead of trying to stack a second
// ModalPopup on top of it, which isn't built to layer more than one at once.
// Works from wherever ThursdayDetailContent is rendered (Thursdays or
// Individual Performance) since it swaps the current pathname's params
// rather than hardcoding a destination page.
export default function EditThursdayButton({ thursdayId, className }: EditThursdayButtonProps) {
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const params = new URLSearchParams(searchParams.toString());
	params.delete(THURSDAY_MODAL_PARAMS.add);
	params.delete(THURSDAY_MODAL_PARAMS.view);
	params.delete(THURSDAY_MODAL_PARAMS.delete);
	params.set(THURSDAY_MODAL_PARAMS.edit, thursdayId);

	return (
		<Button href={`${pathname}?${params.toString()}`} variant="action" icon="edit/edit.svg" className={className}>
			Edit
		</Button>
	);
}

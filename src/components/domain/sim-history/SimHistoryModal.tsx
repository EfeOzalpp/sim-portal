"use client";

import { useSearchParams } from "next/navigation";
import RouteModalPopup from "@/components/modal/RouteModalPopup";
import SimHistoryContent from "@/components/domain/sim-history/SimHistoryContent";
import { SIM_HISTORY_MODAL_PARAM } from "@/constants/modal-params";

export default function SimHistoryModal() {
	const searchParams = useSearchParams();
	if (!searchParams.has(SIM_HISTORY_MODAL_PARAM)) return null;

	return (
		<RouteModalPopup paramName={SIM_HISTORY_MODAL_PARAM} title="SIM History">
			<SimHistoryContent />
		</RouteModalPopup>
	);
}

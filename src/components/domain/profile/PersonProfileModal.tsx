import { auth } from "@/authentication";
import RouteModalPopup from "@/components/modal/RouteModalPopup";
import UserProfileContent from "@/components/domain/users/UserProfileContent";
import { userProfileDialogClassName } from "@/components/domain/users/styles";
import { ACCOUNT_MODAL_PARAMS, USER_MODAL_PARAMS } from "@/constants/modal-params";

interface PersonProfileModalProps {
	profileUserId: string;
}

export default async function PersonProfileModal({ profileUserId }: PersonProfileModalProps) {
	const session = await auth();
	const isCurrentUser = session?.user?.id === profileUserId;

	return (
		<RouteModalPopup
			paramName={USER_MODAL_PARAMS.profile}
			title={isCurrentUser ? "Your Profile" : "Profile"}
			dialogClassName={userProfileDialogClassName}
		>
			<UserProfileContent
				userId={profileUserId}
				editHref={isCurrentUser ? `?${ACCOUNT_MODAL_PARAMS.edit}=1` : undefined}
			/>
		</RouteModalPopup>
	);
}

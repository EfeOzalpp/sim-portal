import { auth } from "@/authentication";
import RouteModalPopup from "@/components/modal/RouteModalPopup";
import UserProfileContent from "@/components/domain/users/UserProfileContent";
import { userProfileDialogClassName } from "@/components/domain/users/styles";

interface PersonProfileModalProps {
	profileUserId: string;
}

export default async function PersonProfileModal({ profileUserId }: PersonProfileModalProps) {
	const session = await auth();
	const isCurrentUser = session?.user?.id === profileUserId;

	return (
		<RouteModalPopup
			paramName="profileUserId"
			title={isCurrentUser ? "Your Profile" : "Profile"}
			dialogClassName={userProfileDialogClassName}
		>
			<UserProfileContent
				userId={profileUserId}
				editHref={isCurrentUser ? "?accountEdit=1" : undefined}
			/>
		</RouteModalPopup>
	);
}

import { auth } from "@/authentication";
import RouteModalPopup from "@/components/modals/ModalPopup/RouteModalPopup";
import UserProfileContent from "@/components/domain/users/UserProfileContent";
import profileStyles from "@/components/domain/users/User.module.css";

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
			dialogClassName={profileStyles.ProfileDialog}
		>
			<UserProfileContent
				userId={profileUserId}
				editHref={isCurrentUser ? "?accountEdit=1" : undefined}
			/>
		</RouteModalPopup>
	);
}

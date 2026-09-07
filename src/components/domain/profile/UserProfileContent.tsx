import { notFound } from "next/navigation";
import { getAuthSession } from "@/actions/auth";
import { getUser } from "@/actions/users";
import UserProfileView from "@/components/domain/users/UserProfileView";

export async function getProfileUser(userId: string) {
	const result = await getUser(userId);
	if (!result.success) {
		notFound();
	}

	return result.data;
}

interface UserProfileContentProps {
	userId: string;
	editHref?: string;
}

export default async function UserProfileContent({
	userId,
	editHref,
}: UserProfileContentProps) {
	const { user: sessionUser } = await getAuthSession();
	if (!sessionUser) return null;

	const user = await getProfileUser(userId);
	const isCurrentUser = sessionUser?.id === user.id;

	return (
		<UserProfileView
			user={user}
			isCurrentUser={isCurrentUser}
			editHref={editHref || `/users?editUserId=${user.id}`}
		/>
	);
}

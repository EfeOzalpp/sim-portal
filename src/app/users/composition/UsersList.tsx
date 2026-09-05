// Actions
import { getFilteredUsers } from "@/actions/users";

// Composition
import UserCardGrid from "@/app/users/composition/UserCardGrid";

export default async function UsersList({ filters }: { filters: any }) {
	const result = await getFilteredUsers(filters);
	const users = result.success ? result.data : [];

	if (users.length < 1) {
		return <div className="p-4 text-[var(--app-muted)]">There are no results for User {filters?.user}</div>;
	}

	return <UserCardGrid users={users} />;
}

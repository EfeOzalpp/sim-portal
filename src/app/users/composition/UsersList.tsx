// Actions
import { getFilteredUsers } from "@/actions/users";

// Composition
import UserCardGrid from "@/app/users/composition/UserCardGrid";

interface UsersListProps {
	filters: any;
	isAdmin?: boolean;
	addUserHref?: string;
}

export default async function UsersList({ filters, isAdmin = false, addUserHref }: UsersListProps) {
	const result = await getFilteredUsers(filters);
	const users = result.success ? result.data : [];

	if (users.length < 1 && !isAdmin) {
		return <div className="p-4 text-[var(--label-text)]">There are no results for User {filters?.user}</div>;
	}

	return <UserCardGrid users={users} isAdmin={isAdmin} addUserHref={addUserHref} searchTerm={filters?.user} />;
}

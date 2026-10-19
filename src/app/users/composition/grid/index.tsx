// Actions
import { getFilteredUsers } from "@/actions/users";

// Composition
import UserCardGrid from "@/app/users/composition/grid/UserCardGrid";

interface UsersListProps {
	filters: any;
	isAdmin?: boolean;
}

export default async function UsersList({ filters, isAdmin = false }: UsersListProps) {
	const result = await getFilteredUsers(filters);
	const users = result.success ? result.data : [];

	if (users.length < 1 && !isAdmin) {
		return <div className="p-4 text-[var(--label-text)]">{filters?.user ? `No people match “${filters.user}”` : "No people to show"}</div>;
	}

	return <UserCardGrid users={users} isAdmin={isAdmin} searchTerm={filters?.user} />;
}

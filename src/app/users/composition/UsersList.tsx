import { getFilteredUsers } from "@/actions/users";
import UserCardGrid from "@/app/users/composition/UserCardGrid";

export default async function UsersList({ filters }: { filters: any }) {
	const result = await getFilteredUsers(filters);
	const users = result.success ? result.data : [];

	if (users.length < 1) {
		return <div>There are no results for User {filters?.user}</div>;
	}

	return <UserCardGrid users={users} />;
}

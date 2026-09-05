import { auth } from "@/authentication";
import { isAdminRole } from "@/constants/roles";

export default async function IndividualLayout({ children }: { children: React.ReactNode }) {
	const session = await auth();
	const isAdmin = isAdminRole(session?.user?.role);

	if (isAdmin) {
		return <>{children}</>;
	}

	return <div>You do not have access to this page.</div>;
}

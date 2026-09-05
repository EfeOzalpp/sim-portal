import { auth } from "@/authentication";
import { isAdminRole } from "@/constants/roles";

export default async function SemesterLayout({ children }: { children: React.ReactNode }) {
	const session = await auth();
	const isAdmin = isAdminRole(session?.user?.role);

	if (isAdmin) {
		return <>{children}</>;
	} else {
		return <div>You do not have access to this page.</div>;
	}
}

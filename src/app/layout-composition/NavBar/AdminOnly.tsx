import { auth } from "@/authentication";
import { isAdminRole } from "@/constants/roles";

interface AdminOnlyProps {
	children: React.ReactNode;
	fallback?: React.ReactNode;
}

export default async function AdminOnly({ children, fallback = null }: AdminOnlyProps) {
	const session = await auth();
	const isAdmin = isAdminRole(session?.user?.role);

	if (!isAdmin) {
		return <>{fallback}</>;
	}

	return <>{children}</>;
}

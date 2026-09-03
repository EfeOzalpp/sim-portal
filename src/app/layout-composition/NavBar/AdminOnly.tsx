import { auth } from "@/authentication";

interface AdminOnlyProps {
	children: React.ReactNode;
	fallback?: React.ReactNode;
}

export default async function AdminOnly({ children, fallback = null }: AdminOnlyProps) {
	const session = await auth();
	const isAdmin = session?.user?.role === "ADMIN";

	if (!isAdmin) {
		return <>{fallback}</>;
	}

	return <>{children}</>;
}

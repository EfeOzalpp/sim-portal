import Welcome from "@/app/welcome/composition/Welcome";
import { Suspense } from "react";

export default function WelcomePage() {
	return (
		<Suspense>
			<Welcome />
		</Suspense>
	);
}

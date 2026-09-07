"use client";

// React & Next.js
import { useSearchParams } from "next/navigation";

// Composition
import { LoginButton } from "@/app/welcome/composition/AuthenticationButtons";

export default function Welcome() {
	const searchParams = useSearchParams();
	const error = searchParams.get("error");
	const isAccessDenied = error === "AccessDenied" || error === "Configuration" || error === "OAuthAccountNotLinked";

	return (
		// data-center-content tells <main>'s grid (layout.module.css) to give
		// this a genuinely flexible row to stretch into, at every breakpoint -
		// h-full is meaningful once that row actually has real height to offer.
		<div data-center-content className="flex h-full w-full items-center justify-center px-6 py-12 text-[var(--app-text)]">
			<div className="flex w-full max-w-[32rem] flex-col items-center gap-4 text-center">
				<h1 className="m-0 font-heading text-3xl font-bold">Welcome to SIM</h1>
				{isAccessDenied ? (
					<div className="flex flex-col gap-2 rounded-xl border border-solid border-[var(--tone-danger-border)] bg-[var(--tone-danger-bg)] p-4 text-[var(--tone-danger-text)]">
						<p className="m-0 text-lg font-bold">
							{error === "OAuthAccountNotLinked" ? "Account Linking Required" : "Access Denied: Your account is not whitelisted."}
						</p>
						<p className="m-0 leading-normal">
							{error === "OAuthAccountNotLinked"
								? "An account with this email already exists but is not linked to this login method. Please contact administration to resolve this."
								: "This website is restricted to authorized SIM students and faculty. If you believe you should have access, please "}
							<a href="mailto:aeochoafader@gmail.com" className="text-inherit underline decoration-current underline-offset-[0.14em]">
								contact administration
							</a>{" "}
							{error !== "OAuthAccountNotLinked" && "to have an account created for you."}
						</p>
					</div>
				) : (
					<p className="m-0 leading-normal text-[var(--app-muted)]">
						This is a private website for the students and faculty of{" "}
						<b className="text-[var(--app-text)]">Studio for Interrelated Media (SIM)</b> department of the{" "}
						<b className="text-[var(--app-text)]">Massachusetts College of Art and Design</b>. Please login with your MassArt account to continue.
					</p>
				)}
				<LoginButton />
				{!isAccessDenied && (
					<p className="m-0 text-sm text-[var(--app-muted)]">
						<i>If you cannot login with your MassArt account, contact the SIM faculty for help.</i>
					</p>
				)}
			</div>
		</div>
	);
}

"use client";

import React from "react";
import { LoginButton } from "@/app/welcome/composition/AuthenticationButtons";
import { useSearchParams } from "next/navigation";

export default function Welcome() {
	const searchParams = useSearchParams();
	const error = searchParams.get("error");
	const isAccessDenied = error === "AccessDenied" || error === "Configuration" || error === "OAuthAccountNotLinked";

	return (
		<div style={{ display: "flex", justifyContent: "center" }}>
			<div style={{ maxWidth: "40rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
				<h1>
					<b>Welcome to SIM</b>
				</h1>
				{isAccessDenied ? (
					<div style={{ textAlign: "center", marginBottom: "1rem" }}>
						<p style={{ color: "#e75f05", fontSize: "1.1rem", fontWeight: "bold" }}>
							{error === "OAuthAccountNotLinked" ? "Account Linking Required" : "Access Denied: Your account is not whitelisted."}
						</p>
						<p>
							{error === "OAuthAccountNotLinked" 
								? "An account with this email already exists but is not linked to this login method. Please contact administration to resolve this."
								: "This website is restricted to authorized SIM students and faculty. If you believe you should have access, please "}
							<a href="mailto:aeochoafader@gmail.com" style={{ color: "#f26419", textDecoration: "underline" }}>
								contact administration
							</a>{" "}
							{error !== "OAuthAccountNotLinked" && "to have an account created for you."}
						</p>
					</div>
				) : (
					<p>
						This is a private website for the students and faculty of <b>Studio for Interrelated Media (SIM)</b> department of the{" "}
						<b>Massachusetts College of Art and Design</b>. Please login with your MassArt account to continue.
					</p>
				)}
				<div style={{ textAlign: "center" }}>
					<LoginButton />
				</div>
				{!isAccessDenied && (
					<p style={{ color: "#e75f05" }}>
						<i>If you cannot login with your MassArt account, contact the SIM faculty for help.</i>
					</p>
				) }
			</div>
		</div>
	);
}

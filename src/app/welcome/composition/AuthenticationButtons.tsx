"use client";

// React & Next.js
import React from "react";

// Actions
import { logIn, logOut } from "@/actions/auth";

// Components
import { Button } from "@/components/button";

export function LoginButton() {
	return <Button onClick={() => logIn()}>Log in</Button>;
}

export function LogoutButton() {
	return <Button onClick={() => logOut()}>Log out</Button>;
}

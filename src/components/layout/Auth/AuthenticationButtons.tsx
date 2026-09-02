"use client";

import React from "react";
import { logIn, logOut } from "@/actions/auth";
import { Button } from "@/components/button/button-component";

export function LoginButton() {
	return <Button onClick={() => logIn()}>Login</Button>;
}

export function LogoutButton() {
	return <Button onClick={() => logOut()}>Logout</Button>;
}

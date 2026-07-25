import "antd/dist/reset.css";
import { Metadata } from "next";
import Script from "next/script";

import { auth } from "@/authentication";

import "./fonts/sour-gummy/sour-gummy.css";
import "./global-styles/app-theme/styling-theme.css";
import "./global-styles/app-theme/font-theme.css";
import "./global-styles/app-theme/layout-theme.css";
import "./global-styles/button-theme.css";
import "./global-styles/input-theme.css";

import AccountModals from "@/components/layout/AccountModals";
import AntdThemeProvider from "@/components/theme/AntdThemeProvider";
import EditUserFormContent from "@/app/users/[id]/edit/EditUserFormContent";
import NavBar from "@/components/layout/NavBar";
import ThemeSessionSync from "@/components/theme/ThemeSessionSync";
import UserProfileContent from "@/components/domain/users/UserProfileContent";
import styles from "@/app/layout.module.css";
import profileStyles from "@/components/domain/users/User.module.css";

// Global metadata for the application
export const metadata: Metadata = {
	title: "SIM App",
	description: "System for Information Management",
};

const themeInitScript = `
(() => {
  try {
    const key = "sim-theme";
    const storedTheme = sessionStorage.getItem(key);
    const isValidTheme = storedTheme === "light" || storedTheme === "dark";

    if (isValidTheme) {
      document.documentElement.dataset.theme = storedTheme;
      return;
    }

    sessionStorage.setItem(key, document.documentElement.dataset.theme || "light");
  } catch {}
})();
`;

// Root layout component that wraps every page and provides global styles and configuration
export default async function RootLayout({ children }: { children: React.ReactNode }) {
	const session = await auth();

	return (
		<html lang="en" data-theme="light" suppressHydrationWarning>
			<body>
				<Script
					id="theme-init"
					strategy="beforeInteractive"
					dangerouslySetInnerHTML={{ __html: themeInitScript }}
				/>
				<ThemeSessionSync />
				<AntdThemeProvider>
					<div className={styles.appShell}>
						<div className={styles.appDivider}>
							{session && (
								<div className={styles.navDivider}>
									<NavBar session={session} />
								</div>
							)}
							<main className={styles.contentDivider}>
								{children}
							</main>
						</div>
					</div>
					{session?.user?.id && (
						<AccountModals
							profileDialogClassName={profileStyles.ProfileDialog}
							profile={
								<UserProfileContent
									userId={session.user.id}
									editHref="?accountEdit=1"
								/>
							}
							edit={
								<EditUserFormContent
									userId={session.user.id}
									showDangerZone={false}
									redirectHref="/users?accountProfile=1"
								/>
							}
						/>
					)}
				</AntdThemeProvider>
			</body>
		</html>
	);
}

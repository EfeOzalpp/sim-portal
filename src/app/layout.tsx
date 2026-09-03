import { Metadata } from "next";
import Script from "next/script";

import { auth } from "@/authentication";

import "@/components/theme/fonts/sour-gummy/sour-gummy.css";
import "@/components/theme/global-styles/antd-reset.css";
import "@/components/theme/global-styles/app-theme/styling-theme.css";
import "@/components/theme/global-styles/app-theme/font-theme.css";
import "@/components/theme/global-styles/app-theme/layout-theme.css";
import "@/components/theme/global-styles/input-theme.css";
import "@/components/theme/global-styles/tailwind.css";

import AccountModals from "@/app/layout-composition/AccountModals";
import EditUserFormContent from "@/app/users/[id]/edit/EditUserFormContent";
import NavBar from "@/app/layout-composition/NavBar";
import ThemeSessionSync from "@/app/layout-composition/ThemeSessionSync";
import UserProfileContent from "@/components/domain/users/UserProfileContent";
import { userProfileDialogClassName } from "@/components/domain/users/styles";
import styles from "@/app/layout.module.css";

const appShellClassName =
	"flex h-dvh min-h-0 flex-col overflow-hidden bg-[var(--app-bg)] text-[var(--app-text)] print:block! print:h-auto! print:overflow-visible!";

const appDividerClassName =
	"flex min-h-0 flex-[1_1_auto] flex-col items-stretch overflow-hidden min-[769px]:flex-row print:block! print:h-auto! print:overflow-visible!";

const navDividerClassName = [
	"relative z-50 min-h-0 min-w-0 flex-none overflow-visible bg-[var(--app-surface)] overscroll-contain",
	"w-full border-r-0 border-b-0 before:content-none print:hidden!",
	"min-[769px]:z-20 min-[769px]:w-auto",
	"min-[769px]:before:invisible min-[769px]:before:block min-[769px]:before:box-border",
	"min-[769px]:before:min-w-[calc(var(--nav-rail-content-width)+1rem+1px)]",
	"min-[769px]:before:whitespace-nowrap min-[769px]:before:border-r min-[769px]:before:border-transparent",
	"min-[769px]:before:p-2 min-[769px]:before:font-heading",
	"min-[769px]:before:text-[2rem] min-[769px]:before:font-bold min-[769px]:before:leading-tight",
	"min-[769px]:before:content-['SIM']",
].join(" ");

const contentDividerClassName =
	"grid h-full min-h-0 min-w-0 flex-[1_1_auto] grid-cols-[minmax(0,1fr)] grid-rows-[auto] content-start items-stretch overflow-auto overscroll-contain bg-[var(--app-surface)] min-[769px]:grid-rows-[auto_minmax(0,1fr)] min-[769px]:overflow-x-hidden min-[769px]:overflow-y-auto print:block! print:h-auto! print:overflow-visible!";

// Global metadata for the application
export const metadata: Metadata = {
	title: "SIM App",
	description: "Studio for Interrelated Media",
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
				<div className={appShellClassName}>
					<div className={appDividerClassName}>
						{session && (
							<div className={navDividerClassName}>
								<NavBar session={session} />
							</div>
						)}
						<main className={`${styles.contentDivider} ${contentDividerClassName}`}>
							{children}
						</main>
					</div>
				</div>
				{session?.user?.id && (
					<AccountModals
						profileDialogClassName={userProfileDialogClassName}
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
			</body>
		</html>
	);
}

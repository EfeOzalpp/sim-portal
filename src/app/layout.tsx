// React & Next.js
import { Metadata } from "next";

// Global styles (side-effect only - order matters for cascade layers)
import "@/theme/fonts/sour-gummy/sour-gummy.css";
import "@/theme/fonts/figtree/figtree.css";
import "@/theme/global-styles/antd-reset.css";
import "@/theme/global-styles/app-theme/styling-theme.css";
import "@/theme/global-styles/mainframe-theme/default.css";
import "@/theme/global-styles/mainframe-theme/purple-green.css";
import "@/theme/global-styles/app-theme/font-theme.css";
import "@/theme/global-styles/tailwind.css";

// Components
import UserProfileContent from "@/components/domain/profile/UserProfileContent";
import { userProfileDialogClassName } from "@/components/domain/profile/styles";

// Composition
import AccountModals from "@/app/layout-composition/AccountModals";
import AppTopBar from "@/app/layout-composition/AppTopBar/AppTopBar";
import EditUserFormContent from "@/app/users/[id]/edit/EditUserFormContent";
import NavBar from "@/app/layout-composition/NavBar/NavBar";
import MobileNavBar from "@/app/layout-composition/NavBar/MobileNavBar";
import ThemeStorageSync from "@/app/layout-composition/ThemeStorageSync";
import SimHistoryModal from "@/components/domain/sim-history/SimHistoryModal";
import { PageChromeProvider } from "@/components/layout/PageChrome";
import { DesktopOnly } from "@/components/layout/breakpoints";
import { ToastProvider } from "@/components/toast";
import styles from "@/app/layout.module.css";

// Helpers
import { auth } from "@/authentication";
import { isAdminRole } from "@/constants/roles";

const appShellClassName =
	"flex h-dvh min-h-0 flex-col overflow-hidden [background:var(--app-bg)] text-[var(--app-text)] print:block! print:h-auto! print:overflow-visible!";

const appDividerClassName =
	"flex min-h-0 flex-[1_1_auto] flex-col items-stretch overflow-hidden print:block! print:h-auto! print:overflow-visible!";

const navDividerClassName = [
	"relative z-[200] min-h-0 min-w-0 flex-none overflow-visible overscroll-contain",
	"w-full border-r-0 border-b-0 print:hidden!",
].join(" ");

const contentDividerClassName =
	"grid h-full min-h-0 min-w-0 flex-[1_1_auto] grid-cols-[minmax(0,1fr)] grid-rows-[auto] content-start items-stretch overflow-auto overscroll-contain print:block! print:h-auto! print:overflow-visible! [--scrollbar-thumb:var(--main-scrollbar-thumb)] [--scrollbar-thumb-hover:var(--main-scrollbar-thumb-hover,var(--main-scrollbar-thumb))]";

const bodyDividerClassName =
	"flex min-h-0 flex-[1_1_auto] flex-col items-stretch overflow-hidden";

// Global metadata for the application
export const metadata: Metadata = {
	title: "Studio for Interrelated Media",
	description: "Studio for Interrelated Media",
};

const themeInitScript = `
(() => {
  try {
    const key = "sim-theme";
    const storedTheme = localStorage.getItem(key);
    const isValidTheme = storedTheme === "light" || storedTheme === "dark";

    if (isValidTheme) {
      document.documentElement.dataset.theme = storedTheme;
      return;
    }

    const theme = "light";
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(key, theme);
  } catch {}
})();
`;

// Same before-paint pattern as themeInitScript above, for the independent
// [data-color-theme] axis (mainframe-theme/*.css) - keeps its own storage key
// since it's a separate choice from light/dark.
const colorThemeInitScript = `
(() => {
  try {
    const key = "sim-color-theme";
    const storedColorTheme = localStorage.getItem(key);
    const isValidColorTheme = storedColorTheme === "default" || storedColorTheme === "purple-green";

    if (isValidColorTheme) {
      document.documentElement.dataset.colorTheme = storedColorTheme;
      return;
    }

    localStorage.setItem(key, document.documentElement.dataset.colorTheme || "default");
  } catch {}
})();
`;

// Root layout component that wraps every page and provides global styles and configuration
export default async function RootLayout({ children }: { children: React.ReactNode }) {
	const session = await auth();

	return (
		<html lang="en" data-theme="light" data-color-theme="default" className="h-full overflow-hidden print:h-auto print:overflow-visible" suppressHydrationWarning>
			{/* Explicit <head> so this runs before first paint, not just hydration - avoids the light-mode flash. */}
			<head>
				<script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
				<script dangerouslySetInnerHTML={{ __html: colorThemeInitScript }} />
			</head>
			{/* icon.tsx covers light mode/no dark support; this one only kicks in for a reported dark preference. */}
			<link rel="icon" href="/icon-dark.png" media="(prefers-color-scheme: dark)" />
			<body className="m-0 h-full overflow-hidden print:h-auto print:overflow-visible">
				<ToastProvider>
					<ThemeStorageSync />
					<div className={appShellClassName}>
						<PageChromeProvider>
							<div className={appDividerClassName}>
								{session && <AppTopBar user={session.user} />}
								<div className={`${styles.bodyDivider} ${bodyDividerClassName}`}>
									{session && (
										<>
											{/* Desktop rail, below the full-width app topbar. */}
											<div className={`${styles.desktopNav} ${navDividerClassName}`}>
												<DesktopOnly>
													<NavBar session={session} />
												</DesktopOnly>
											</div>
											<div className={`${styles.mobileNav} ${navDividerClassName}`}>
												<MobileNavBar isAdmin={isAdminRole(session.user?.role)} user={session.user} />
											</div>
										</>
									)}
									{/* Route-owned page content renders inside this grid. */}
									<main className={`${styles.contentDivider} ${contentDividerClassName}`}>
										{children}
									</main>
								</div>
							</div>
						</PageChromeProvider>
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
					<SimHistoryModal />
				</ToastProvider>
			</body>
		</html>
	);
}

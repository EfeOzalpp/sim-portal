// React & Next.js
import { Metadata, type Viewport } from "next";

// Global styles (side-effect only - order matters for cascade layers)
import "@/theme/fonts/sour-gummy/sour-gummy.css";
import "@/theme/fonts/figtree/figtree.css";
import "@/theme/antd-reset.css";
import "@/theme/app-theme/styling-theme.css";
import "@/theme/mainframe-theme/default.css";
import "@/theme/mainframe-theme/purple-green.css";
import "@/theme/app-theme/font-theme.css";
import "@/theme/tailwind.css";

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
import { peopleGridInitScript } from "@/constants/people-grid";

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
export const viewport: Viewport = {
	// Default light chrome until ThemeStorageSync resolves the active CSS palette.
	themeColor: "#f2e4f6",
};

export const metadata: Metadata = {
	title: "Studio for Interrelated Media",
	description: "Studio for Interrelated Media",
	icons: {
		icon: [
			{ url: "/favicon.ico", sizes: "16x16 32x32 48x48", type: "image/x-icon" },
			{ url: "/icons/icon-96.png", sizes: "96x96", type: "image/png" },
		],
		apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
	},
	manifest: "/site.webmanifest",
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
		<html lang="en" data-theme="light" data-color-theme="default" className="h-full overflow-hidden [background:var(--browser-chrome-bg,var(--app-bg))] print:h-auto print:overflow-visible" suppressHydrationWarning>
			{/* Explicit <head> so this runs before first paint, not just hydration - avoids the light-mode flash. */}
			<head>
				<script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
				<script dangerouslySetInnerHTML={{ __html: colorThemeInitScript }} />
				<script dangerouslySetInnerHTML={{ __html: peopleGridInitScript }} />
			</head>
			<body className="m-0 h-full overflow-hidden [background:var(--browser-chrome-bg,var(--app-bg))] print:h-auto print:overflow-visible">
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

// React & Next.js
import { Metadata } from "next";

// Global styles (side-effect only - order matters for cascade layers)
import "@/theme/fonts/sour-gummy/sour-gummy.css";
import "@/theme/global-styles/antd-reset.css";
import "@/theme/global-styles/app-theme/styling-theme.css";
import "@/theme/global-styles/mainframe-theme/default.css";
import "@/theme/global-styles/mainframe-theme/purple-green.css";
import "@/theme/global-styles/app-theme/font-theme.css";
import "@/theme/global-styles/app-theme/layout-theme.css";
import "@/theme/global-styles/tailwind.css";

// Components
import UserProfileContent from "@/components/domain/profile/UserProfileContent";
import { userProfileDialogClassName } from "@/components/domain/profile/styles";

// Composition
import AccountModals from "@/app/layout-composition/AccountModals";
import EditUserFormContent from "@/app/users/[id]/edit/EditUserFormContent";
import NavBar from "@/app/layout-composition/NavBar";
import ThemeStorageSync from "@/app/layout-composition/ThemeStorageSync";
import SimHistoryModal from "@/components/domain/sim-history/SimHistoryModal";
import { ToastProvider } from "@/components/toast";
import styles from "@/app/layout.module.css";

// Helpers
import { auth } from "@/authentication";

const appShellClassName =
	// "image:" type hint routes this to background-image, not Tailwind's default background-color, since --app-bg holds a gradient.
	"flex h-dvh min-h-0 flex-col overflow-hidden bg-[image:var(--app-bg)] text-[var(--app-text)] print:block! print:h-auto! print:overflow-visible!";

const appDividerClassName =
	"flex min-h-0 flex-[1_1_auto] flex-col items-stretch overflow-hidden min-[769px]:flex-row print:block! print:h-auto! print:overflow-visible!";

const navDividerClassName = [
	// z-[200]: above nav/Select dropdown, below ActionMode/modal. bg is mobile-only -
	// the desktop rail (NavBar.module.css's .root) has none at rest either, only on hover.
	// Desktop: w-0, not a reserved width - the rail itself is position:absolute (NavBar.module.css's
	// .root), so it never needed this div to have real width; collapsing it lets .contentDivider
	// (layout.module.css) reclaim that space as its own left gutter column instead, which is what
	// [data-page-content]'s drop-shadow needs room to bleed into.
	"relative z-[200] min-h-0 min-w-0 flex-none overflow-visible max-[768px]:bg-[var(--app-surface)] overscroll-contain",
	"w-full border-r-0 border-b-0 print:hidden!",
	"min-[769px]:w-0",
].join(" ");

const contentDividerClassName =
	// No bg here - NavContent paints its own area, the gradient shows through the rest. min-[769px]:overflow-y-hidden since only the content column scrolls now, not <main>.
	// [--scrollbar-thumb:...]: cascade-scoped, same mechanism as --button-bg/--input-bg -
	// modals render outside <main> (portaled to <body>), so they never inherit this and
	// keep the plain --scrollbar-thumb/-hover instead.
	"grid h-full min-h-0 min-w-0 flex-[1_1_auto] grid-cols-[minmax(0,1fr)] grid-rows-[auto] content-start items-stretch overflow-auto overscroll-contain min-[769px]:grid-rows-[auto_minmax(0,1fr)] min-[769px]:overflow-x-hidden min-[769px]:overflow-y-hidden print:block! print:h-auto! print:overflow-visible! [--scrollbar-thumb:var(--main-scrollbar-thumb)] [--scrollbar-thumb-hover:var(--main-scrollbar-thumb-hover)]";

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
					<SimHistoryModal />
				</ToastProvider>
			</body>
		</html>
	);
}

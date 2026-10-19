import clsx from "clsx";
import PresentationCard from "@/components/domain/productions/PresentationCard";
import ProductionSummaryCard from "@/components/domain/productions/ProductionSummaryCard";
import FaceImage from "@/components/primitives/FaceImage";
import AboutText from "@/components/domain/profile/AboutText";
import SemesterTimeline from "@/components/domain/profile/SemesterTimeline";
import ProfileEmail from "@/components/domain/profile/ProfileEmail";
import TruncatedHoverLink from "@/components/domain/profile/TruncatedHoverLink";
import { logOut } from "@/actions/auth";
import { getDisplayUserLinks, getUserLinkHref } from "@/actions/user-links";
import { groupSemesterRanges } from "@/components/domain/filters/semester-filter";
import { Button } from "@/components/button";
import { getStringColors } from "@/constants/stringColors";
import StringLabel from "@/components/primitives/StringLabel";
import styles from "@/components/domain/profile/UserProfileView.module.css";

function getEmailLabel(email: string) {
	const domain = email.split("@")[1]?.toLowerCase() ?? "";

	if (domain.endsWith("massart.edu")) return "Massart Email";
	if (domain.endsWith("gmail.com")) return "Gmail";
	if (domain.endsWith("hotmail.com")) return "Hotmail";
	return "Email";
}

interface UserProfileViewProps {
	user: any;
	isCurrentUser?: boolean;
	/** Admins can edit anyone's profile, not just their own - see the footer row below. */
	isAdmin?: boolean;
	editHref?: string;
}

export default function UserProfileView({
	user,
	isCurrentUser = false,
	isAdmin = false,
	editHref,
}: UserProfileViewProps) {
	const roleLabel = user.role.charAt(0) + user.role.slice(1).toLowerCase();
	const nameColors = getStringColors(`person:${user.id}`);
	const semesterRanges = groupSemesterRanges((user.semesters || []).map((semester: any) => semester.name));
	const links = getDisplayUserLinks(user.link);
	const pronouns = user.pronouns?.trim();
	const about = user.about?.trim();
	const canEdit = isCurrentUser || isAdmin;
	const hasProductions = (user.productions?.length ?? 0) > 0;
	const hasPresentations = (user.presentations?.length ?? 0) > 0;
	const profileLinks = links.length > 0 ? (
		<div className="flex min-w-0 flex-col gap-2">
			<span className="ui-label block">Links</span>
			<div className="is-body flex min-w-0 flex-col gap-1 text-[var(--app-text)]">
				{links.map((link, index) => {
					const href = getUserLinkHref(link);
					const linkKey = `${link}-${index}`;
					return href ? (
						<TruncatedHoverLink
							key={linkKey}
							href={href}
							text={link}
							external
							className="break-words text-[var(--app-text)] no-underline decoration-current underline-offset-[0.14em] hover:text-[var(--inline-link-hover)]"
						/>
					) : (
						<span key={linkKey} className="break-words text-[var(--app-text)]">{link}</span>
					);
				})}
			</div>
		</div>
	) : null;

	return (
		<div className={styles.root}>
			<div className={styles.layout}>
				<aside className={styles.sidebar}>
					<div className="relative aspect-[5/6] w-full max-[768px]:aspect-auto max-[768px]:self-stretch overflow-hidden rounded-lg border-solid border-[var(--modal-border)] border">
						<FaceImage
							imagePath={user.image}
							alt={`${user.name}'s image`}
							sizes="(max-width: 768px) 9rem, 14rem"
							className="object-cover object-top"
						/>
					</div>
					<div className="flex min-w-0 flex-col gap-4 max-[768px]:pt-[0.6rem]">
					<StringLabel colorKey={`role:${user.role}`} className="ml-2 self-start">
						{roleLabel}
					</StringLabel>
					<SemesterTimeline items={semesterRanges} />
					<div className="ml-2 flex min-w-0 flex-col gap-2 max-[768px]:gap-1">
						<span className="ui-label block">{getEmailLabel(user.email)}</span>
						<ProfileEmail email={user.email} />
					</div>
					{profileLinks && <div className="ml-2 min-w-0 max-[768px]:hidden">{profileLinks}</div>}
					</div>
				</aside>
				<section className="flex min-w-0 flex-col gap-4">
					<div className="flex flex-col gap-1 [&_h2]:m-0">
						<div className={styles.header}>
							<h2 className="min-w-0 pt-2" style={{ color: nameColors.text }}>{user.name}</h2>
						</div>
						{pronouns && (
							<div className="is-body text-[var(--subtle-text)]">
								{pronouns}
							</div>
						)}
					</div>
					<div className="flex min-w-0 flex-col gap-2 pb-2">
						<span className={clsx("ui-label block", !about && "text-[var(--content-muted)]")}>About</span>
						<div className="ui-reading flex min-w-0 flex-col gap-1 break-words text-[var(--app-text)]">
							{about ? (
								<AboutText text={about} />
							) : (
								<span className="ui-note">
									{isCurrentUser
										? "You have not written an about yet."
										: "This user has not written an about yet."}
								</span>
							)}
						</div>
					</div>
					{profileLinks && <div className="min-w-0 pb-2 min-[769px]:hidden">{profileLinks}</div>}
					<div className="flex min-w-0 flex-col gap-2 pb-4">
						<span className={clsx("ui-label block", !hasProductions && "text-[var(--content-muted)]")}>Productions</span>
						<div className="flex flex-col gap-2 [&>*]:m-0">
							{hasProductions ? (
								user.productions?.map((production: any) => (
									<ProductionSummaryCard
										key={production.id}
										production={production}
									/>
								))
							) : (
								<span className="ui-note">
									{isCurrentUser
										? "You have not been credited on any productions yet."
										: "This user has not been credited on any productions yet."}
								</span>
							)}
						</div>
					</div>
					<div className="flex min-w-0 flex-col gap-2 pb-2">
						<span className={clsx("ui-label block", !hasPresentations && "text-[var(--content-muted)]")}>Presentations</span>
						<div className="flex flex-col gap-2 [&>*]:m-0">
							{hasPresentations ? (
								user.presentations?.map((presentation: any) => (
									<PresentationCard
										key={presentation.id}
										presentation={presentation}
										isUserProfile={true}
									/>
								))
							) : (
								<span className="ui-note">
									{isCurrentUser
										? "You have not made any presentations yet."
										: "This user has not made any presentations yet."}
								</span>
							)}
						</div>
					</div>
				</section>
			</div>
			{canEdit && (
				<div className="pointer-events-none sticky -bottom-8 mt-auto -mx-4 -mb-8 flex flex-row items-center gap-2 bg-transparent px-4 pt-3 pb-8 [&_form]:m-0 [&>*]:pointer-events-auto">
					{editHref && (
						<Button surface="modal" href={editHref} variant="action" className="ml-auto">
							Edit profile
						</Button>
					)}
					{isCurrentUser && (
						<form action={logOut}>
							<Button surface="modal" type="submit" tone="danger" icon="logout/logout.svg">
								Log out
							</Button>
						</form>
					)}
				</div>
			)}
		</div>
	);
}

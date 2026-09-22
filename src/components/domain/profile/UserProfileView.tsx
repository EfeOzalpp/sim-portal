import clsx from "clsx";
import PresentationCard from "@/components/domain/productions/PresentationCard";
import ProductionSummaryCard from "@/components/domain/productions/ProductionSummaryCard";
import FaceImage from "@/components/primitives/FaceImage";
import AboutText from "@/components/domain/profile/AboutText";
import SemesterTimeline from "@/components/domain/profile/SemesterTimeline";
import EmailHoverLink from "@/components/domain/profile/EmailHoverLink";
import { logOut } from "@/actions/auth";
import { getDisplayUserLinks, getUserLinkHref } from "@/actions/user-links";
import { groupSemesterRanges } from "@/components/domain/filters/semester-filter";
import { Button } from "@/components/button";
import { getLabelColors } from "@/constants/labelColors";

function getEmailLabel(email: string) {
	const domain = email.split("@")[1]?.toLowerCase() ?? "";

	if (domain.endsWith("massart.edu")) return "Massart Email";
	if (domain.endsWith("gmail.com")) return "Gmail";
	if (domain.endsWith("hotmail.com")) return "Hotmail";
	return "Email";
}

function getTruncatedEmail(email: string) {
	if (email.length <= 21) return email;
	return `${email.slice(0, 21)}..`;
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
	const roleColors = getLabelColors(`role:${user.role}`);
	const semesterRanges = groupSemesterRanges((user.semesters || []).map((semester: any) => semester.name));
	const links = getDisplayUserLinks(user.link);
	const pronouns = user.pronouns?.trim();
	const about = user.about?.trim();
	const canEdit = isCurrentUser || isAdmin;
	const hasProductions = (user.productions?.length ?? 0) > 0;
	const hasPresentations = (user.presentations?.length ?? 0) > 0;

	return (
		<div className="flex min-h-full flex-col">
			<div className="grid w-full min-w-0 grid-cols-[minmax(10rem,13rem)_minmax(0,1fr)] gap-6 max-[767px]:grid-cols-1">
				<aside className="flex min-w-0 flex-col gap-4">
					<div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg border-solid border-[var(--modal-border)] border">
						<FaceImage
							imagePath={user.image}
							alt={`${user.name}'s image`}
							sizes="(max-width: 767px) calc(100vw - 2rem), 13rem"
							className="object-cover object-top"
						/>
					</div>
					<div
						className="ml-2 self-start rounded-md px-2 py-1 font-sans text-xs leading-tight font-semibold uppercase"
						style={{ backgroundColor: roleColors.bg, color: roleColors.text }}
					>
						{roleLabel}
					</div>
					<SemesterTimeline items={semesterRanges} />
					<div className="ml-2 flex min-w-0 flex-col gap-2">
						<span className="ui-label block">{getEmailLabel(user.email)}</span>
						<EmailHoverLink
							email={user.email}
							displayLabel={getTruncatedEmail(user.email)}
							className="break-words text-[var(--app-text)] no-underline decoration-current underline-offset-[0.14em] hover:text-[var(--brand-color)]"
						/>
					</div>
					{links.length > 0 && (
						<div className="ml-2 flex min-w-0 flex-col gap-2">
							<span className="ui-label block">Links</span>
							<div className="flex min-w-0 flex-col gap-1 leading-normal text-[var(--app-text)]">
								{links.map((link, index) => {
									const href = getUserLinkHref(link);
									const linkKey = `${link}-${index}`;

									return href ? (
										<a
											key={linkKey}
											href={href}
											target="_blank"
											rel="noopener noreferrer"
											className="break-words text-[var(--app-text)] no-underline decoration-current underline-offset-[0.14em] hover:text-[var(--brand-color)]"
										>
											{link}
										</a>
									) : (
										<span key={linkKey} className="break-words text-[var(--app-text)]">
											{link}
										</span>
									);
								})}
							</div>
						</div>
					)}
				</aside>
				<section className="flex min-w-0 flex-col gap-4">
					<div className="flex flex-col gap-1 [&_h2]:m-0">
						<div className="flex min-w-0 items-center justify-between gap-4 max-[767px]:flex-col max-[767px]:items-start">
							<h2 className="min-w-0 pt-2">{user.name}</h2>
						</div>
						{pronouns && (
							<div className="text-xl leading-normal text-[var(--subtle-text)]">
								{pronouns}
							</div>
						)}
					</div>
					<div className="flex min-w-0 flex-col gap-2 pb-2">
						<span className={clsx("ui-label block", !about && "text-[var(--content-muted)]")}>About</span>
						<div className="flex min-w-0 flex-col gap-1 leading-normal break-words text-[var(--app-text)]">
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
					<div className={clsx("flex min-w-0 flex-col pb-4", hasProductions ? "gap-3" : "gap-2")}>
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
					<div className={clsx("flex min-w-0 flex-col pb-2", hasPresentations ? "gap-3" : "gap-2")}>
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
				<div className="sticky -bottom-4 mt-auto -mx-4 -mb-4 flex flex-row items-center gap-2 bg-[linear-gradient(to_bottom,transparent,var(--app-gray-surface)_50%)] px-4 pt-6 pb-4 [&_form]:m-0">
					{editHref && (
						<Button href={editHref} variant="action" className="ml-auto">
							Edit profile
						</Button>
					)}
					{isCurrentUser && (
						<form action={logOut}>
							<Button type="submit" tone="danger">
								Log out
							</Button>
						</form>
					)}
				</div>
			)}
		</div>
	);
}

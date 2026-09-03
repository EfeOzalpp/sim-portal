import PresentationCard from "@/components/domain/thursdays/PresentationCard";
import Image from "next/image";
import { logOut } from "@/actions/auth";
import { getDisplayUserLinks, getUserLinkHref } from "@/actions/user-links";
import { normalizeFaceImagePath } from "@/helpers";
import { Button } from "@/components/button";

interface UserProfileViewProps {
	user: any;
	isCurrentUser?: boolean;
	editHref?: string;
}

export default function UserProfileView({
	user,
	isCurrentUser = false,
	editHref,
}: UserProfileViewProps) {
	const roleLabel = user.role.charAt(0) + user.role.slice(1).toLowerCase();
	const links = getDisplayUserLinks(user.link);
	const pronouns = user.pronouns?.trim();
	const about = user.about?.trim();

	return (
		<div className="grid w-full min-w-0 grid-cols-[minmax(10rem,13rem)_minmax(0,1fr)] gap-[var(--gap-md)] max-[767px]:grid-cols-1">
			<aside className="flex min-w-0 flex-col gap-[var(--gap-md)]">
				<div className="relative aspect-square w-full overflow-hidden rounded-[var(--border-md)] border-solid border-[var(--app-border)] [border-width:var(--app-border-width)]">
					<Image
						src={normalizeFaceImagePath(user.image || "")}
						alt={`${user.name}'s image`}
						fill
						sizes="(max-width: 767px) calc(100vw - 2rem), 13rem"
						className="object-cover object-top"
					/>
				</div>
				<div className="self-start rounded-[var(--border-lg)] border-solid border-[var(--app-border)] bg-[var(--app-card-label-bg)] px-[var(--spacing-sm)] py-[calc(var(--spacing-sm)/2)] font-[family-name:var(--font-family-label)] text-[length:var(--font-size-label)] leading-[var(--line-height-label)] font-[var(--font-weight-label)] text-[var(--app-muted)] uppercase [border-width:var(--app-border-width)]">
					{roleLabel}
				</div>
				<div className="flex min-w-0 flex-col gap-[calc(var(--gap-sm)/2)]">
					<span className="ui-label block">Email</span>
					<a
						href={`mailto:${user.email}`}
						className="break-words text-[var(--app-text)] no-underline decoration-current underline-offset-[0.14em] hover:text-[var(--brand-color)]"
					>
						{user.email}
					</a>
				</div>
				<div className="flex min-w-0 flex-col gap-[calc(var(--gap-sm)/2)]">
					<span className="ui-label block">Contact & Links</span>
					<div className="flex min-w-0 flex-col gap-[calc(var(--gap-sm)/2)] leading-[var(--line-height-base)] text-[var(--app-text)]">
						{links.length > 0 ? (
							links.map((link, index) => {
								const href = getUserLinkHref(link);
								const linkKey = `${link}-${index}`;

								return href ? (
									<a
										key={linkKey}
										href={href}
										target="_blank"
										rel="noopener noreferrer"
										className="break-words text-[var(--app-text)] decoration-current underline-offset-[0.14em] hover:text-[var(--brand-color)]"
									>
										{link}
									</a>
								) : (
									<span key={linkKey} className="break-words text-[var(--app-text)]">
										{link}
									</span>
								);
							})
						) : (
							<span className="ui-note">
								{isCurrentUser
									? "You have not added contact links yet."
									: "No contact links yet."}
							</span>
						)}
					</div>
				</div>
			</aside>
			<section className="flex min-w-0 flex-col gap-[var(--gap-md)]">
				<div className="flex flex-col gap-[calc(var(--gap-sm)/2)] border-b-[length:var(--app-border-width)] border-solid border-[var(--app-border)] pb-[var(--spacing-md)] [&_h2]:m-0">
					<div className="flex min-w-0 items-center justify-between gap-[var(--gap-sm)] max-[767px]:flex-col max-[767px]:items-start">
						<h2 className="min-w-0">{user.name}</h2>
					</div>
					{pronouns && (
						<div className="text-[length:var(--font-size-lg)] leading-[var(--line-height-base)] text-[var(--app-muted)]">
							{pronouns}
						</div>
					)}
				</div>
				<div className="flex min-w-0 flex-col gap-[calc(var(--gap-sm)/2)]">
					<h3 className="m-0 text-[length:var(--font-size-h3)]">About</h3>
					<div className="flex min-w-0 flex-col gap-[calc(var(--gap-sm)/2)] leading-[var(--line-height-base)] text-[var(--app-text)]">
						{about ? (
							about
						) : (
							<span className="ui-note">
								{isCurrentUser
									? "You have not written an about yet."
									: "This user has not written an about yet."}
							</span>
						)}
					</div>
				</div>
				<div className="flex min-w-0 flex-col gap-[calc(var(--gap-sm)/2)]">
					<h3 className="m-0 text-[length:var(--font-size-h3)]">Presentations</h3>
					<div className="flex flex-col gap-[var(--gap-sm)] [&>*]:m-0">
						{(user.presentations?.length ?? 0) > 0 ? (
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
			{isCurrentUser && (
				<div className="col-[1/-1] flex flex-row items-center gap-[var(--gap-sm)] border-t-[length:var(--app-border-width)] border-solid border-[var(--app-border)] pt-[var(--spacing-md)] [&_form]:m-0">
					<form action={logOut}>
						<Button type="submit" tone="danger">
							Log Out
						</Button>
					</form>
					{editHref && (
						<Button href={editHref} variant="action">
							Edit Profile
						</Button>
					)}
				</div>
			)}
		</div>
	);
}

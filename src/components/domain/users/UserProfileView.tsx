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
		<div className="grid w-full min-w-0 grid-cols-[minmax(10rem,13rem)_minmax(0,1fr)] gap-4 max-[767px]:grid-cols-1">
			<aside className="flex min-w-0 flex-col gap-4">
				<div className="relative aspect-square w-full overflow-hidden rounded-xl border-solid border-[var(--app-border)] border">
					<Image
						src={normalizeFaceImagePath(user.image || "")}
						alt={`${user.name}'s image`}
						fill
						sizes="(max-width: 767px) calc(100vw - 2rem), 13rem"
						className="object-cover object-top"
					/>
				</div>
				<div className="self-start rounded-2xl border-solid border-[var(--app-border)] bg-[var(--app-card-label-bg)] px-2 py-1 font-sans text-[0.6875rem] leading-tight font-semibold text-[var(--app-muted)] uppercase border">
					{roleLabel}
				</div>
				<div className="flex min-w-0 flex-col gap-1">
					<span className="ui-label block">Email</span>
					<a
						href={`mailto:${user.email}`}
						className="break-words text-[var(--app-text)] no-underline decoration-current underline-offset-[0.14em] hover:text-[var(--brand-color)]"
					>
						{user.email}
					</a>
				</div>
				<div className="flex min-w-0 flex-col gap-1">
					<span className="ui-label block">Contact & Links</span>
					<div className="flex min-w-0 flex-col gap-1 leading-normal text-[var(--app-text)]">
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
			<section className="flex min-w-0 flex-col gap-4">
				<div className="flex flex-col gap-1 border-b border-b-[var(--app-border)] pb-4 [&_h2]:m-0">
					<div className="flex min-w-0 items-center justify-between gap-2 max-[767px]:flex-col max-[767px]:items-start">
						<h2 className="min-w-0">{user.name}</h2>
					</div>
					{pronouns && (
						<div className="text-xl leading-normal text-[var(--app-muted)]">
							{pronouns}
						</div>
					)}
				</div>
				<div className="flex min-w-0 flex-col gap-1">
					<h3 className="m-0 text-xl">About</h3>
					<div className="flex min-w-0 flex-col gap-1 leading-normal text-[var(--app-text)]">
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
				<div className="flex min-w-0 flex-col gap-1">
					<h3 className="m-0 text-xl">Presentations</h3>
					<div className="flex flex-col gap-2 [&>*]:m-0">
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
				<div className="col-[1/-1] flex flex-row items-center gap-2 border-t border-t-[var(--app-border)] pt-4 [&_form]:m-0">
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

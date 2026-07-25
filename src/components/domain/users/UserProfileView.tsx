import PresentationCard from "@/components/domain/thursdays/PresentationCard";
import { logOut } from "@/actions/auth";
import { getDisplayUserLinks, getUserLinkHref } from "@/components/forms/user/user-links";
import { normalizeFaceImagePath } from "@/helpers";
import { Button } from "@/components/primitives/AntD";
import styles from "@/components/domain/users/User.module.css";

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
		<div className={styles.ProfileView}>
			<aside className={styles.ProfileAside}>
				<div className={styles.UserImage}>
					<img
						src={normalizeFaceImagePath(user.image || "")}
						alt={`${user.name}'s image`}
					/>
				</div>
				<div className={styles.RoleBadge}>{roleLabel}</div>
				<div className={styles.ProfileSection}>
					<span className={`${styles.Label} ui-label`}>Email</span>
					<a href={`mailto:${user.email}`} className={styles.EmailValue}>
						{user.email}
					</a>
				</div>
				<div className={styles.ProfileSection}>
					<span className={`${styles.Label} ui-label`}>Contact & Links</span>
					<div className={styles.Value}>
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
										className={styles.LinkValue}
									>
										{link}
									</a>
								) : (
									<span key={linkKey} className={styles.PlainLinkValue}>
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
			<section className={styles.ProfileMain}>
				<div className={styles.ProfileHeader}>
					<div className={styles.ProfileTitleRow}>
						<h2>{user.name}</h2>
					</div>
					{pronouns && <div className={styles.ProfilePronouns}>{pronouns}</div>}
				</div>
				<div className={styles.ProfileSection}>
					<h3 className={styles.SectionTitle}>About</h3>
					<div className={styles.Value}>
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
				<div className={styles.ProfileSection}>
					<h3 className={styles.SectionTitle}>Presentations</h3>
					<div className={styles.PresentationsList}>
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
				<div className={styles.ProfileFooter}>
					<form action={logOut}>
						<Button htmlType="submit" className="decline-button">
							Log Out
						</Button>
					</form>
					{editHref && (
						<Button href={editHref} className="action-button">
							Edit Profile
						</Button>
					)}
				</div>
			)}
		</div>
	);
}

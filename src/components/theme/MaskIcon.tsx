import { resolveIconSrc, type IconName } from "@/components/theme/icons";

interface MaskIconProps {
	icon: IconName;
	className?: string;
}

// Applies a known icon as a mask-image via inline style, not a Tailwind
// class — see icons.ts for why a dynamic icon name can't go through Tailwind.
export function MaskIcon({ icon, className }: MaskIconProps) {
	const src = resolveIconSrc(icon);

	return (
		<span
			className={className}
			style={{ maskImage: `url(${src})`, WebkitMaskImage: `url(${src})` }}
			aria-hidden="true"
		/>
	);
}

export default MaskIcon;

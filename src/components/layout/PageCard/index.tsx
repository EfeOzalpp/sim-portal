import type { ComponentPropsWithoutRef } from "react";
import clsx from "clsx";
import styles from "@/components/layout/PageCard/PageCard.module.css";

interface PageCardProps extends ComponentPropsWithoutRef<"div"> {
	padded?: boolean;
}

export default function PageCard({ padded = false, className, ...props }: PageCardProps) {
	return <div {...props} className={clsx(styles.root, padded && styles.padded, className)} />;
}

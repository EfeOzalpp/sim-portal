"use client";

import { useEffect, useRef, type ComponentPropsWithoutRef } from "react";
import clsx from "clsx";
import { usePageChrome, usePageChromeScroll } from "@/components/layout/PageChrome";
import styles from "@/components/layout/PageChrome/PageChromeScrollArea.module.css";

type PageChromeScrollAreaProps = ComponentPropsWithoutRef<"div">;

export default function PageChromeScrollArea({
	className,
	onScroll,
	children,
	...props
}: PageChromeScrollAreaProps) {
	const reportPageScroll = usePageChromeScroll();
	const { reportScrollTop } = usePageChrome();
	const scrollAreaRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		reportScrollTop(scrollAreaRef.current?.scrollTop ?? 0);
	}, [reportScrollTop]);

	return (
		<div
			{...props}
			ref={scrollAreaRef}
			className={clsx(styles.root, className)}
			onScroll={(event) => {
				reportPageScroll(event);
				onScroll?.(event);
			}}
		>
			{children}
		</div>
	);
}

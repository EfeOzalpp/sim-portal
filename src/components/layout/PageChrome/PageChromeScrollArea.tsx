"use client";

import { useEffect, useRef, type ComponentPropsWithoutRef } from "react";
import clsx from "clsx";
import { usePageChrome } from "@/components/layout/PageChrome";
import { useTopPullReopen } from "./useTopPullReopen";
import styles from "@/components/layout/PageChrome/PageChromeScrollArea.module.css";

type PageChromeScrollAreaProps = ComponentPropsWithoutRef<"div"> & {
	/** Reopen mobile chrome on a fresh gesture at the top or a fast continuous return to it. */
	requireTopGesture?: boolean;
};

export default function PageChromeScrollArea({
	className,
	onScroll,
	onWheel,
	onTouchStart,
	onTouchMove,
	onTouchEnd,
	onTouchCancel,
	requireTopGesture = false,
	children,
	...props
}: PageChromeScrollAreaProps) {
	const { reportScrollTop } = usePageChrome();
	const scrollAreaRef = useRef<HTMLDivElement>(null);
	const pull = useTopPullReopen(requireTopGesture);

	useEffect(() => {
		reportScrollTop(scrollAreaRef.current?.scrollTop ?? 0);
	}, [reportScrollTop]);

	return (
		<div
			{...props}
			ref={scrollAreaRef}
			className={clsx(styles.root, className)}
			onScroll={(event) => {
				pull.reportScroll(event.currentTarget);
				onScroll?.(event);
			}}
			onWheel={(event) => {
				pull.onWheel(event);
				onWheel?.(event);
			}}
			onTouchStart={(event) => {
				pull.onTouchStart(event);
				onTouchStart?.(event);
			}}
			onTouchMove={(event) => {
				pull.onTouchMove(event);
				onTouchMove?.(event);
			}}
			onTouchEnd={(event) => {
				pull.onTouchEnd();
				onTouchEnd?.(event);
			}}
			onTouchCancel={(event) => {
				pull.onTouchCancel();
				onTouchCancel?.(event);
			}}
		>
			{children}
		</div>
	);
}

"use client";

import { useCallback, useRef, type TouchEvent, type WheelEvent } from "react";
import { usePageChrome } from "./index";

const TOP_TOLERANCE = 1;
const GESTURE_SLOP = 6;
const WHEEL_GESTURE_GAP = 180;
const CONTINUOUS_WINDOW = 120;
const FAST_SCROLL_SPEED = 0.6; // Pixels per millisecond.
const FAST_SCROLL_DISTANCE = 24;

function isMobile() {
	return window.matchMedia("(max-width: 768px)").matches;
}

export function useTopPullReopen(enabled = true) {
	const { reportScrollTop, isCollapsed } = usePageChrome();
	const gestureRef = useRef<{ startedAtTop: boolean; pull: number } | null>(null);
	const touchRef = useRef<{ y: number; startX: number; startY: number } | null>(null);
	const wheelTimeRef = useRef(-Infinity);
	const motionRef = useRef<{ top: number; time: number; distance: number; fastUntil: number } | null>(null);
	const reopenedRef = useRef(false);

	function startGesture(target: HTMLElement) {
		gestureRef.current = { startedAtTop: target.scrollTop <= TOP_TOLERANCE, pull: 0 };
		motionRef.current = { top: Math.max(0, target.scrollTop), time: performance.now(), distance: 0, fastUntil: 0 };
	}

	function reportPull(target: HTMLElement, delta: number) {
		const gesture = gestureRef.current;
		if (!enabled || !isCollapsed || !isMobile() || !gesture?.startedAtTop || target.scrollTop > TOP_TOLERANCE) return;
		gesture.pull = Math.max(0, gesture.pull + delta);
		if (gesture.pull >= GESTURE_SLOP) {
			reopenedRef.current = true;
			reportScrollTop(0);
		}
	}

	const reportScroll = useCallback((target: HTMLElement) => {
		const top = Math.max(0, target.scrollTop);
		if (!enabled || !isMobile()) {
			reportScrollTop(top);
			return;
		}
		const now = performance.now();
		const previous = motionRef.current;
		let distance = 0;
		let fastUntil = 0;
		if (top > TOP_TOLERANCE) {
			reopenedRef.current = false;
			if (gestureRef.current) gestureRef.current.startedAtTop = false;
		}

		// Actual scroll velocity includes native touch momentum after the finger lifts.
		if (previous && gestureRef.current) {
			const delta = previous.top - top;
			const elapsed = now - previous.time;
			if (delta > 0 && elapsed > 0 && elapsed <= CONTINUOUS_WINDOW) {
				distance = previous.distance + delta;
				fastUntil = previous.fastUntil;
				if (distance >= FAST_SCROLL_DISTANCE && delta / elapsed >= FAST_SCROLL_SPEED) {
					fastUntil = now + CONTINUOUS_WINDOW;
				}
			}
			if (top <= TOP_TOLERANCE && previous.top > TOP_TOLERANCE && fastUntil > now) {
				reopenedRef.current = true;
			}
		}
		motionRef.current = { top, time: now, distance, fastUntil };
		reportScrollTop(reopenedRef.current ? 0 : top, {
			requireTopPull: !reopenedRef.current,
		});
	}, [enabled, reportScrollTop]);

	return {
		reportScroll,
		onWheel(event: WheelEvent<HTMLElement>) {
			if (!enabled || !isMobile()) return;
			if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
			const now = performance.now();
			if (!gestureRef.current || now - wheelTimeRef.current > WHEEL_GESTURE_GAP) startGesture(event.currentTarget);
			wheelTimeRef.current = now;
			const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? event.currentTarget.clientHeight : 1;
			reportPull(event.currentTarget, -event.deltaY * unit);
		},
		onTouchStart(event: TouchEvent<HTMLElement>) {
			if (!enabled || !isMobile()) return;
			const touch = event.touches[0];
			if (event.touches.length !== 1 || !touch) {
				gestureRef.current = null;
				touchRef.current = null;
				return;
			}
			touchRef.current = { y: touch.clientY, startX: touch.clientX, startY: touch.clientY };
			startGesture(event.currentTarget);
		},
		onTouchMove(event: TouchEvent<HTMLElement>) {
			const touch = event.touches[0];
			const previous = touchRef.current;
			if (!touch || !previous || event.touches.length !== 1) {
				gestureRef.current = null;
				touchRef.current = null;
				return;
			}
			if (Math.abs(touch.clientY - previous.startY) > Math.abs(touch.clientX - previous.startX)) {
				reportPull(event.currentTarget, touch.clientY - previous.y);
			} else {
				gestureRef.current = null;
			}
			touchRef.current = { ...previous, y: touch.clientY };
		},
		onTouchEnd() {
			touchRef.current = null;
		},
		onTouchCancel() {
			touchRef.current = null;
			gestureRef.current = null;
		},
	};
}

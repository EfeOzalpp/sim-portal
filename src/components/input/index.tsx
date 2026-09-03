import { useRef, type InputHTMLAttributes, type ReactNode, type Ref, type TextareaHTMLAttributes } from "react";
import clsx from "clsx";
import {
	inputBareClassName,
	inputClearButtonClassName,
	inputFieldVariants,
	inputIconClassName,
	inputWrapperVariants,
} from "@/components/input/styles";
import { MaskIcon } from "@/components/theme/MaskIcon";

interface SharedInputProps {
	status?: "error" | "";
	className?: string;
}

export interface InputProps
	extends SharedInputProps,
		Omit<InputHTMLAttributes<HTMLInputElement>, keyof SharedInputProps | "prefix" | "suffix"> {
	/** Rendered inside the field's border, before the value. */
	prefix?: ReactNode;
	/** Rendered inside the field's border, after the value. */
	suffix?: ReactNode;
	/** Shows a clear button once there's a value; requires a controlled value + onChange. */
	allowClear?: boolean;
	ref?: Ref<HTMLInputElement>;
}

function mergeRefs(...refs: Array<Ref<HTMLInputElement> | undefined>) {
	return (node: HTMLInputElement | null) => {
		for (const ref of refs) {
			if (typeof ref === "function") ref(node);
			else if (ref) (ref as { current: HTMLInputElement | null }).current = node;
		}
	};
}

export function Input({
	status,
	className,
	prefix,
	suffix,
	allowClear,
	value,
	onChange,
	ref,
	...props
}: InputProps) {
	const error = status === "error";
	const hasAffix = !!(prefix || suffix || allowClear);
	const inputRef = useRef<HTMLInputElement>(null);

	// Clears by actually driving the DOM input — through the native value
	// setter (so React notices the change) and a real dispatched "input"
	// event (the event React's onChange is backed by for text inputs) —
	// rather than calling onChange with a hand-built fake ChangeEvent. A
	// mocked event object lies to the type system: any consumer that calls
	// event.preventDefault()/stopPropagation() or reads event.currentTarget
	// would crash. This way the event is genuine, so it behaves exactly like
	// the user clearing the field by hand.
	function clear() {
		const input = inputRef.current;
		if (!input) return;

		const setValue = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
		setValue?.call(input, "");
		input.dispatchEvent(new Event("input", { bubbles: true }));
	}

	if (!hasAffix) {
		return (
			<input
				{...props}
				ref={mergeRefs(inputRef, ref)}
				value={value}
				onChange={onChange}
				className={clsx(inputFieldVariants({ error }), className)}
			/>
		);
	}

	return (
		<span className={inputWrapperVariants({ error })}>
			{prefix}
			<input
				{...props}
				ref={mergeRefs(inputRef, ref)}
				value={value}
				onChange={onChange}
				className={clsx(inputBareClassName, className)}
			/>
			{allowClear && !!value && (
				<button
					type="button"
					className={inputClearButtonClassName}
					aria-label="Clear"
					onClick={clear}
				>
					<MaskIcon icon="close/close.svg" className={inputIconClassName} />
				</button>
			)}
			{suffix}
		</span>
	);
}

export interface TextAreaProps
	extends SharedInputProps,
		Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, keyof SharedInputProps> {
	ref?: Ref<HTMLTextAreaElement>;
}

export function TextArea({ status, className, ref, ...props }: TextAreaProps) {
	const error = status === "error";

	return (
		<textarea
			{...props}
			ref={ref}
			className={clsx(inputFieldVariants({ error }), "resize-y", className)}
		/>
	);
}

export default Input;

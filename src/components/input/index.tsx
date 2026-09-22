import { useRef, type InputHTMLAttributes, type ReactNode, type Ref, type TextareaHTMLAttributes } from "react";
import clsx from "clsx";
import { LoadingOutlined } from "@ant-design/icons";
import {
	inputBareClassName,
	inputClearButtonClassName,
	inputFieldVariants,
	inputIconClassName,
	inputSpinnerClassName,
	inputWrapperVariants,
} from "@/components/input/styles";
import { MaskIcon } from "@/theme/MaskIcon";

interface SharedInputProps {
	status?: "error" | "warning" | "";
	className?: string;
}

// The two right-hand-side behaviors are mutually exclusive by construction -
// "clearable" (an "x" once there's a value, or a spinner while `loading`) and
// "filter" (embeds `filterTrigger` instead) can't both be active on the same
// input, since they're one `mode` field rather than independent props.
export type InputMode = "clearable" | "filter";

export interface InputProps
	extends SharedInputProps,
		Omit<InputHTMLAttributes<HTMLInputElement>, keyof SharedInputProps | "prefix"> {
	/** Rendered inside the field's border, before the value. */
	prefix?: ReactNode;
	/** Picks what (if anything) renders inside the field's border, after the value - see InputMode. */
	mode?: InputMode;
	/** mode="clearable" only - shows a spinner in place of the "x" while true. */
	loading?: boolean;
	/** mode="filter" only - the trigger rendered on the field's right edge. */
	filterTrigger?: ReactNode;
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
	mode,
	loading,
	filterTrigger,
	value,
	onChange,
	ref,
	...props
}: InputProps) {
	const cvaStatus = status || "none";
	const hasAffix = !!(prefix || mode);
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
				className={clsx(inputFieldVariants({ status: cvaStatus }), className)}
			/>
		);
	}

	return (
		<span className={inputWrapperVariants({ status: cvaStatus })}>
			{prefix}
			<input
				{...props}
				ref={mergeRefs(inputRef, ref)}
				value={value}
				onChange={onChange}
				className={clsx(inputBareClassName, className)}
			/>
			{mode === "clearable" && (
				loading ? (
					<span className={inputSpinnerClassName}>
						<LoadingOutlined spin />
					</span>
				) : (
					!!value && (
						<button
							type="button"
							className={inputClearButtonClassName}
							aria-label="Clear"
							onClick={clear}
						>
							<MaskIcon icon="close/close.svg" className={inputIconClassName} />
						</button>
					)
				)
			)}
			{mode === "filter" && filterTrigger}
		</span>
	);
}

export interface TextAreaProps
	extends SharedInputProps,
		Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, keyof SharedInputProps> {
	ref?: Ref<HTMLTextAreaElement>;
}

export function TextArea({ status, className, ref, ...props }: TextAreaProps) {
	return (
		<textarea
			{...props}
			ref={ref}
			className={clsx(inputFieldVariants({ status: status || "none" }), "resize-y", className)}
		/>
	);
}

export default Input;

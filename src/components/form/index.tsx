import type { ComponentPropsWithoutRef, ReactNode } from "react";
import clsx from "clsx";
import { FieldError, fieldLabelRowClassName, type FieldErrorProps } from "./FieldError";

export function Form({ className, ...props }: ComponentPropsWithoutRef<"form">) {
	return <form {...props} className={clsx("flex min-h-full flex-col", className)} />;
}

interface FormStackProps extends ComponentPropsWithoutRef<"div"> {
	spacing?: "compact" | "default" | "relaxed";
}

const stackSpacing = { compact: "gap-6", default: "gap-8", relaxed: "gap-10" };

export function FormStack({ spacing = "default", className, ...props }: FormStackProps) {
	return <div {...props} className={clsx("flex min-w-0 flex-col", stackSpacing[spacing], className)} />;
}

interface FormFieldProps extends ComponentPropsWithoutRef<"div"> {
	label: ReactNode;
	htmlFor?: string;
	required?: boolean;
	error?: string;
	errorTone?: FieldErrorProps["tone"];
	help?: ReactNode;
}

export function FormField({ label, htmlFor, required, error, errorTone, help, children, className, ...props }: FormFieldProps) {
	const Label = htmlFor ? "label" : "span";
	return (
		<div {...props} className={clsx("flex min-w-0 flex-col gap-2", className)}>
			<div className={fieldLabelRowClassName}>
				<Label htmlFor={htmlFor} className="ui-label m-0 block min-h-5 shrink-0 whitespace-nowrap pl-1">
					{label}{required && " *"}
				</Label>
				{error && <FieldError tone={errorTone}>{error}</FieldError>}
			</div>
			{children}
			{help && <div className="ui-note">{help}</div>}
		</div>
	);
}

interface FormActionsProps extends ComponentPropsWithoutRef<"div"> {
	separated?: boolean;
}

export function FormActions({ separated = true, className, ...props }: FormActionsProps) {
	return <div {...props} className={clsx("flex flex-wrap items-center justify-start gap-2", separated && "mt-6", className)} />;
}

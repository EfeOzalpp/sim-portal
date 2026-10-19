import { cva } from "class-variance-authority";

// The row holding one item's trigger plus its optional trailing "extra" content.
export const collapseHeaderRowClassName = "flex min-w-0 items-stretch";

// The clickable trigger itself, sized to share the row with any "extra"
// content. Explicit appearance/border/bg/margin/padding/font reset because
// it renders as a real <button> - without one, the browser's native button
// chrome (a gray bordered/beveled look) shows through on top of whatever
// background the consumer's headerClassName sets on the row around it.
export const collapseTriggerClassName = "flex min-w-0 flex-1 cursor-pointer items-center text-left appearance-none border-0 bg-transparent p-0 m-0 font-inherit text-inherit";
export const modalCollapseItemVariants = cva(
	"overflow-hidden rounded-none border-0 transition-colors duration-150 data-[state=closed]:hover:[background-image:linear-gradient(var(--modal-tint),var(--modal-tint))]",
	{
		variants: {
			depth: {
				2: "bg-[var(--modal-surface-2)]",
				3: "bg-[var(--modal-surface-3)]",
			},
		},
		defaultVariants: { depth: 2 },
	},
);

export const modalCollapseHeaderClassName =
	"min-h-[3.75rem] rounded-none bg-transparent text-[var(--app-text)] [[data-state=open]>&]:border-b [[data-state=open]>&]:border-b-[var(--modal-separator)] [[data-state=open]>&]:hover:[background-image:linear-gradient(var(--modal-tint),var(--modal-tint))]";
export const modalCollapseTriggerClassName = "group px-4 py-2";
export const modalCollapseLabelClassName = "inline-flex min-w-0 items-center gap-2 text-[var(--app-text)]";
export const modalCollapseTitleClassName = "modal-collapse-title min-w-0 overflow-hidden text-ellipsis whitespace-nowrap";
export const modalCollapseIconClassName =
	"h-5 w-5 flex-none bg-[var(--input-icon)] transition-[background,transform] duration-200 [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain] group-hover:bg-[var(--app-text)] group-focus-within:bg-[var(--app-text)] group-aria-expanded:rotate-180";
export const modalCollapseExtraClassName = "flex flex-none items-center pr-4";
export const modalCollapseContentClassName = "px-4 py-4 text-[var(--app-text)]";

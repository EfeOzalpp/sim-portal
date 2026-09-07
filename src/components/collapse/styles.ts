// The row holding one item's trigger plus its optional trailing "extra" content.
export const collapseHeaderRowClassName = "flex items-stretch";

// The clickable trigger itself, sized to share the row with any "extra"
// content. Explicit appearance/border/bg/margin/padding/font reset because
// it renders as a real <button> - without one, the browser's native button
// chrome (a gray bordered/beveled look) shows through on top of whatever
// background the consumer's headerClassName sets on the row around it.
export const collapseTriggerClassName = "flex min-w-0 flex-1 cursor-pointer items-center text-left appearance-none border-0 bg-transparent p-0 m-0 font-inherit text-inherit";

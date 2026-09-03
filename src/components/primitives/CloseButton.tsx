import clsx from "clsx";
import Block from "@/components/primitives/Block";
import closeIcon from "@/components/theme/assets/close/close.svg";

interface CloseButtonProps {
  href: string;
  className?: string;
}

export default function CloseButton({ href, className }: CloseButtonProps) {
  return (
    <Block
      as="a"
      href={href}
      pressable
      aria-label="Close"
      className={clsx(
        "inline-flex h-10 w-10 items-center justify-center rounded-2xl text-[var(--app-icon)] hover:bg-[var(--nav-button-bg-hover)] hover:text-[var(--app-text)]",
        className,
      )}
    >
      <span
        className="h-4 w-4 bg-current [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]"
        style={{
          maskImage: `url(${typeof closeIcon === "string" ? closeIcon : closeIcon.src})`,
          WebkitMaskImage: `url(${typeof closeIcon === "string" ? closeIcon : closeIcon.src})`,
        }}
        aria-hidden="true"
      />
    </Block>
  );
}
